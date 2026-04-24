import os
import secrets
from pathlib import Path
from urllib.parse import urlparse

from vercel.blob import delete as blob_delete
from vercel.blob import put as blob_put

from backend.database.config import get_settings

settings = get_settings()


def blob_storage_enabled() -> bool:
    return bool((os.getenv("BLOB_READ_WRITE_TOKEN", "").strip() or settings.blob_read_write_token).strip())


def is_blob_url(file_path: str) -> bool:
    parsed = urlparse(file_path)
    return parsed.scheme in {"http", "https"} and parsed.netloc.endswith("blob.vercel-storage.com")


def save_upload(file_name: str, file_bytes: bytes, user_id: int, content_type: str | None = None) -> str:
    safe_name = Path(file_name).name

    if blob_storage_enabled():
        pathname = f"documents/{user_id}/{secrets.token_urlsafe(8)}-{safe_name}"
        blob = blob_put(
            pathname,
            file_bytes,
            access="private",
            content_type=content_type,
            add_random_suffix=False,
        )
        return blob.url

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    target_path = upload_dir / f"{user_id}_{safe_name}"
    target_path.write_bytes(file_bytes)
    return str(target_path)


def delete_upload(file_path: str) -> None:
    if not file_path:
        return

    if is_blob_url(file_path):
        blob_delete(file_path)
        return

    path = Path(file_path)
    if path.exists():
        path.unlink()
