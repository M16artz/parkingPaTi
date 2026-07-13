import os
from dataclasses import dataclass

from django.core.exceptions import ImproperlyConfigured


@dataclass(frozen=True)
class DriveUpload:
    file_id: str
    web_view_link: str


class GoogleDriveStorage:
    def __init__(self):
        self.folder_id = os.environ.get("GOOGLE_DRIVE_FOLDER_ID", "")
        self.credentials_path = os.environ.get("GOOGLE_DRIVE_CREDENTIALS_PATH", "")
        self._service = None

    def _get_service(self):
        if not self.folder_id or not self.credentials_path:
            raise ImproperlyConfigured("Google Drive no esta configurado.")
        if self._service is None:
            from google.oauth2 import service_account
            from googleapiclient.discovery import build

            credentials = service_account.Credentials.from_service_account_file(
                self.credentials_path,
                scopes=["https://www.googleapis.com/auth/drive.file"],
            )
            self._service = build("drive", "v3", credentials=credentials, cache_discovery=False)
        return self._service

    def upload(self, name, content):
        from googleapiclient.http import MediaIoBaseUpload

        media = MediaIoBaseUpload(content, mimetype=content.content_type, resumable=True)
        result = self._get_service().files().create(
            body={"name": name, "parents": [self.folder_id]},
            media_body=media,
            fields="id,webViewLink",
        ).execute()
        return DriveUpload(file_id=result["id"], web_view_link=result["webViewLink"])

    def delete(self, file_id):
        self._get_service().files().delete(fileId=file_id).execute()
