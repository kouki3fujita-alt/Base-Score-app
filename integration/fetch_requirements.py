from googleapiclient.discovery import build
from secure_connect import get_credentials, log_action, log_security_event
import os

def search_files(query_name):
    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds)
    
    # Search for files with the name
    query = f"name contains '{query_name}' and trashed = false"
    try:
        results = service.files().list(
            q=query, pageSize=10, fields="nextPageToken, files(id, name, mimeType)").execute()
        items = results.get('files', [])
        return items
    except Exception as e:
        print(f"Error searching drive: {e}")
        return []

def read_google_doc(file_id):
    creds = get_credentials()
    service = build('docs', 'v1', credentials=creds)
    try:
        document = service.documents().get(documentId=file_id).execute()
        
        # Simple text extractor
        content = ""
        for struct in document.get('body').get('content'):
            if 'paragraph' in struct:
                elements = struct.get('paragraph').get('elements')
                for elem in elements:
                    if 'textRun' in elem:
                        content += elem.get('textRun').get('content')
        return content
    except Exception as e:
        print(f"Error reading doc: {e}")
        return ""

if __name__ == '__main__':
    target_name = "Base_Score_要件定義書"
    log_action(f"Searching for requirements document: {target_name}")
    found_files = search_files(target_name)
    
    if not found_files:
        print(f"No files found with name '{target_name}'.")
        print("Trying broader search for '要件定義書'...")
        found_files = search_files("要件定義書")

    if not found_files:
        print("Still no files found.")
    else:
        for f in found_files:
            print(f"Found: {f['name']} ({f['id']})")
            if f['mimeType'] == 'application/vnd.google-apps.document':
                print(f"Reading content from {f['name']}...")
                text = read_google_doc(f['id'])
                if text:
                    filename = f"requirements_doc.txt"
                    with open(filename, "w") as local_f:
                        local_f.write(text)
                    print(f"SUCCESS: Content saved to integration/{filename}")
                    print("--- START CONTENT PREVIEW ---")
                    print(text[:500])
                    print("--- END CONTENT PREVIEW ---")
            else:
                print(f"Skipping non-Doc file: {f['mimeType']}")
