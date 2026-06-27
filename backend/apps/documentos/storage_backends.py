"""
Adaptador de almacenamiento a Google Drive.

NOTA DE SUPUESTO IMPORTANTE: no existe un backend directo equivalente a
S3Boto3Storage para Google Drive. Este adaptador es una implementacion
minima de referencia usando la libreria google-api-python-client; en un
entorno real se recomienda envolver esta clase con manejo de reintentos y
cuotas de la API de Drive (ver docs/auditoria-tecnica.md, hallazgo de
Compatibilidad sobre Google Drive).

Esta clase se mantiene deliberadamente aislada en su propio archivo dentro
de apps/documentos/ y NO en settings/, para que el resto del backend nunca
dependa directamente de la API de Google - solo de esta interfaz.
"""

from django.core.files.storage import Storage
from decouple import config


class GoogleDriveStorage(Storage):
    """
    Implementacion minima de un backend de almacenamiento sobre Google Drive.
    Requiere credenciales de una cuenta de servicio configuradas via
    variables de entorno (GOOGLE_DRIVE_CREDENTIALS_JSON, GOOGLE_DRIVE_FOLDER_ID).

    NOTA: esta clase requiere las dependencias google-api-python-client y
    google-auth, que NO se incluyen en requirements/base.txt por defecto
    para no forzar su instalacion si el equipo decide usar otro proveedor
    de almacenamiento en el futuro. Instalar con:
        pip install google-api-python-client google-auth --break-system-packages
    """

    def __init__(self):
        self.folder_id = config("GOOGLE_DRIVE_FOLDER_ID", default="")
        self._service = None

    def _get_service(self):
        if self._service is None:
            from google.oauth2 import service_account
            from googleapiclient.discovery import build

            credentials_path = config("GOOGLE_DRIVE_CREDENTIALS_PATH")
            credentials = service_account.Credentials.from_service_account_file(
                credentials_path, scopes=["https://www.googleapis.com/auth/drive.file"]
            )
            self._service = build("drive", "v3", credentials=credentials)
        return self._service

    def _save(self, name, content):
        from googleapiclient.http import MediaIoBaseUpload

        service = self._get_service()
        file_metadata = {"name": name, "parents": [self.folder_id]}
        media = MediaIoBaseUpload(content, mimetype=content.content_type, resumable=True)

        archivo = service.files().create(
            body=file_metadata, media_body=media, fields="id, webViewLink"
        ).execute()

        # Se devuelve el file ID como "nombre" guardado; la ruta completa
        # (webViewLink) se debe persistir aparte en el modelo Documento.ruta
        return archivo["id"]

    def _open(self, name, mode="rb"):
        raise NotImplementedError(
            "La lectura directa de archivos no esta implementada en este adaptador; "
            "usar el campo `ruta` del modelo Documento para obtener el enlace publico."
        )

    def exists(self, name):
        # Simplificacion para el MVP: se asume que si hay un ID guardado, existe.
        # Una implementacion completa deberia consultar service.files().get(fileId=name).
        return bool(name)

    def url(self, name):
        return f"https://drive.google.com/file/d/{name}/view"
