from backend.database.config import get_settings


def verify_firebase_id_token(id_token: str) -> dict:
    try:
        import firebase_admin
        from firebase_admin import auth, credentials
    except ImportError as exc:
        raise RuntimeError("firebase-admin is not installed on the backend yet.") from exc

    settings = get_settings()

    if not firebase_admin._apps:
        credentials_path = settings.firebase_credentials_path.strip()
        if credentials_path:
            firebase_admin.initialize_app(credentials.Certificate(credentials_path))
        else:
            firebase_admin.initialize_app()

    try:
        return auth.verify_id_token(id_token)
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError("Unable to verify Firebase token. Check your Firebase Admin credentials.") from exc
