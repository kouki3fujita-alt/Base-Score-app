from googleapiclient.discovery import build
from secure_connect import get_credentials
import os

def list_recent_files():
    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds)
    
    print("\n--- Listing Recent Files (Top 20) ---")
    try:
        # List files, not filtering by name
        results = service.files().list(
            pageSize=20, 
            fields="nextPageToken, files(id, name, mimeType, modifiedTime)",
            orderBy="modifiedTime desc"
        ).execute()
        items = results.get('files', [])

        if not items:
            print("No files found.")
        else:
            for item in items:
                print(f"[File] {item['name']} (ID: {item['id']})")
    except Exception as e:
        print(f"Error listing files: {e}")

if __name__ == '__main__':
    list_recent_files()
