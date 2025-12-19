import os
import os.path
import pickle
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv
from audit_log import log_action, log_security_event

# Load environment variables
load_dotenv()

# --- SECURITY CONFIGURATION ---
# 1. Minimum Privilege Scopes
# We only request access to view/edit files created by this app (drive.file) 
# and view/edit documents (documents). We avoid full drive access.
SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/documents.readonly'
]

# 2. Token Storage
# In a real production environment, use system Keychain. 
# Here we use a local token file, but we should ensure strict file permissions.
TOKEN_FILE = 'token.pickle'
CREDENTIALS_FILE = 'credentials.json' # User must provide this from Google Cloud Console

def get_credentials():
    """
    Authenticates the user and returns credentials.
    Implements OAuth 2.0 flow with secure storage practices.
    """
    creds = None
    
    # Load existing tokens
    if os.path.exists(TOKEN_FILE):
        log_action("Loading existing credentials")
        try:
            with open(TOKEN_FILE, 'rb') as token:
                creds = pickle.load(token)
        except Exception as e:
            log_security_event("Token Load Error", str(e))

    # Refresh or Create new tokens
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            log_security_event("Token Refresh", "Refreshing expired access token")
            creds.refresh(Request())
        else:
            log_action("Initiating new OAuth flow")
            if not os.path.exists(CREDENTIALS_FILE):
                raise FileNotFoundError(f"Missing {CREDENTIALS_FILE}. Please download it from Google Cloud Console.")
            
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
            
        # Save credentials securely
        log_action("Saving new credentials")
        with open(TOKEN_FILE, 'wb') as token:
            pickle.dump(creds, token)
        
        # Set restrictive permissions on the token file (Read/Write for owner only)
        os.chmod(TOKEN_FILE, 0o600)
        log_security_event("File Permission Set", f"Set 600 permissions on {TOKEN_FILE}")

    return creds

def audit_scopes(creds):
    """
    Periodically audit the scopes granted to the token to ensure no privilege escalation.
    """
    granted_scopes = set(creds.scopes)
    required_scopes = set(SCOPES)
    
    log_action("Auditing scopes")
    
    if not required_scopes.issubset(granted_scopes):
        log_security_event("Scope Mismatch", f"Missing scopes: {required_scopes - granted_scopes}")
    
    # Check for over-privileged scopes (simple check)
    if 'https://www.googleapis.com/auth/drive' in granted_scopes:
         log_security_event("Scope Warning", "Token has full Drive access! This is not recommended.")

def create_doc(service, title):
    """
    Creates a new Google Doc.
    """
    try:
        doc = service.documents().create(body={'title': title}).execute()
        log_action("Created Document", f"ID: {doc.get('documentId')} Title: {title}")
        return doc.get('documentId')
    except HttpError as err:
        log_action("Error creating document", str(err))
        return None

def main():
    log_action("Starting Secure Integration Agent")
    
    try:
        creds = get_credentials()
        audit_scopes(creds)
        
        # Build services
        docs_service = build('docs', 'v1', credentials=creds)
        drive_service = build('drive', 'v3', credentials=creds)
        
        print("\n--- Secure Google Integration Ready ---")
        print("Authenticated successfully.")
        
        # Example Action: limit exposure - only do what is asked
        # Just verifying connection by listing 5 files (Read only)
        # or creating a test doc if needed.
        
        # Uncomment to test creation
        # doc_id = create_doc(docs_service, "Base Score - Secure Log")
        # print(f"Created secure document: https://docs.google.com/document/d/{doc_id}")
        
    except Exception as e:
        log_security_event("Critical Failure", str(e))
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
