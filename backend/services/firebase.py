import base64
import json

from backend.database.config import get_settings


def _load_firebase_credentials_json(raw_value: str) -> dict:
    cleaned = raw_value.strip().strip("'")
    if not cleaned:
        raise RuntimeError("FIREBASE_CREDENTIALS_JSON is empty.")

    candidates = [cleaned]

    if cleaned.startswith('"') and cleaned.endswith('"'):
        try:
            decoded_string = json.loads(cleaned)
            if isinstance(decoded_string, str):
                candidates.append(decoded_string)
        except json.JSONDecodeError:
            pass

    candidates.append(cleaned.replace("\\n", "\n"))

    try:
        base64_decoded = base64.b64decode(cleaned, validate=True).decode("utf-8")
        candidates.append(base64_decoded)
    except Exception:  # noqa: BLE001
        pass

    for candidate in candidates:
        try:
            parsed = json.loads(candidate)
        except json.JSONDecodeError:
            continue

        if isinstance(parsed, dict) and parsed.get("project_id") and parsed.get("private_key"):
            return parsed

    raise RuntimeError(
        "FIREBASE_CREDENTIALS_JSON is not valid Firebase service-account JSON. "
        "Paste the full service account JSON object, or paste a base64-encoded version of it."
    )


def verify_firebase_id_token(id_token: str) -> dict:
    try:
        import firebase_admin
        from firebase_admin import auth, credentials
    except ImportError as exc:
        raise RuntimeError("firebase-admin is not installed on the backend yet.") from exc

    settings = get_settings()

    if not firebase_admin._apps:
        credentials_json = settings.firebase_credentials_json.strip()
        credentials_path = settings.firebase_credentials_path.strip()

        if credentials_json:
            firebase_admin.initialize_app(credentials.Certificate(_load_firebase_credentials_json(credentials_json)))
        elif credentials_path:
            firebase_admin.initialize_app(credentials.Certificate(credentials_path))
        else:
            firebase_admin.initialize_app()

    try:
        return auth.verify_id_token(id_token)
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError("Unable to verify Firebase token. Check your Firebase Admin credentials.") from exc
