import os
import uuid
from dataclasses import dataclass
from pathlib import Path

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


@dataclass(frozen=True)
class DriveUpload:
    file_id: str
    web_view_link: str


class LocalPrivateStorage:
    """Almacenamiento privado de desarrollo, sin ruta HTTP publica."""

    PREFIX = "local:"

    def __init__(self, root=None):
        self.root = Path(root or settings.PRIVATE_DOCUMENT_ROOT).resolve()

    def upload(self, name, content):
        self.root.mkdir(parents=True, exist_ok=True)
        safe_name = Path(name).name
        storage_name = f"{uuid.uuid4().hex}_{safe_name}"
        destination = (self.root / storage_name).resolve()
        if destination.parent != self.root:
            raise ValueError("La ruta del documento no es valida.")

        temporary = destination.with_suffix(f"{destination.suffix}.tmp")
        try:
            with temporary.open("wb") as target:
                for chunk in content.chunks():
                    target.write(chunk)
            temporary.replace(destination)
        except Exception:
            temporary.unlink(missing_ok=True)
            raise
        return DriveUpload(file_id=f"{self.PREFIX}{storage_name}", web_view_link="")

    def delete(self, file_id):
        self._path(file_id).unlink(missing_ok=True)

    def open(self, file_id):
        return self._path(file_id).open("rb")

    def _path(self, file_id):
        if not file_id.startswith(self.PREFIX):
            raise ValueError("El identificador no pertenece al almacenamiento local.")
        destination = (self.root / file_id.removeprefix(self.PREFIX)).resolve()
        if destination.parent != self.root:
            raise ValueError("La ruta del documento no es valida.")
        return destination


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


def get_document_storage(file_id=None):
    if file_id and file_id.startswith(LocalPrivateStorage.PREFIX):
        return LocalPrivateStorage()
    backend = settings.PRIVATE_DOCUMENT_STORAGE.lower()
    if backend == "local":
        return LocalPrivateStorage()
    if backend == "drive":
        return GoogleDriveStorage()
    raise ImproperlyConfigured("PRIVATE_DOCUMENT_STORAGE debe ser 'local' o 'drive'.")
