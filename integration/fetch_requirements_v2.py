from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from secure_connect import get_credentials, log_action
import io
import os
import zipfile
import xml.etree.ElementTree as ET

def get_docx_text(file_content):
    """
    Take in-memory bytes content of a docx file and extract text using standard zip/xml parsing.
    (Docx is a zip of xmls).
    """
    try:
        with zipfile.ZipFile(io.BytesIO(file_content)) as myzip:
            with myzip.open('word/document.xml') as myfile:
                xml_content = myfile.read()
                root = ET.fromstring(xml_content)
                # Word XML namespace often uses 'w' prefix
                # We want to find all <w:t> tags
                # Define namespace strictly if needed, or iterate
                namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
                text_content = []
                for node in root.findall('.//w:t', namespaces):
                    if node.text:
                        text_content.append(node.text)
                return '\n'.join(text_content)
    except Exception as e:
        return f"[Error extracting DOCX text: {e}]"

def download_file(file_id, mime_type, file_name):
    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds)
    
    print(f"Downloading {file_name}...")
    try:
        # If it's a native Google Doc, export. If it's binary (docx), get_media.
        if 'application/vnd.google-apps' in mime_type:
            request = service.files().export_media(fileId=file_id, mimeType='text/plain')
        else:
            request = service.files().get_media(fileId=file_id)
            
        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
        
        content = fh.getvalue()
        
        # If it was a docx, parse it
        if file_name.endswith('.docx'):
            return get_docx_text(content)
        # If text/plain export
        return content.decode('utf-8')
        
    except Exception as e:
        print(f"Error downloading: {e}")
        return None

def search_files(query_name):
    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds)
    query = f"name contains '{query_name}' and trashed = false"
    results = service.files().list(q=query, fields="files(id, name, mimeType)").execute()
    return results.get('files', [])

if __name__ == '__main__':
    target_name = "Base_Score_要件定義書"
    log_action(f"Fetching content for: {target_name}")
    found = search_files(target_name)
    
    if found:
        f = found[0]
        print(f"Target found: {f['name']}")
        content = download_file(f['id'], f['mimeType'], f['name'])
        
        if content:
            save_path = "requirements_doc.txt"
            with open(save_path, "w") as out:
                out.write(content)
            print(f"Success! Saved to {save_path}")
            print("\n--- CONTENT START ---")
            print(content[:600]) # Preview
            print("--- CONTENT END ---")
    else:
        print("File not found.")
