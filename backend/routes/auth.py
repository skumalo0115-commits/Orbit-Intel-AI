import re
import secrets

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from backend.database.config import get_settings
from backend.database.session import get_db
from backend.models.user import User
from backend.schemas.auth import (
    ForgotPasswordRequest,
    ForgotUsernameRequest,
    GoogleAuthRequest,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from backend.services.email import EmailDeliveryError, send_password_reset_email, send_username_recovery_email, send_welcome_email
from backend.services.firebase import verify_firebase_id_token
from backend.services.security import (
    create_access_token,
    create_password_reset_token,
    decode_password_reset_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


def _token_response(user: User) -> TokenResponse:
    subject = (user.email or user.username or "").strip().lower()
    return TokenResponse(
        access_token=create_access_token(subject=subject),
        username=(user.username or "").strip(),
        email=(user.email or "").strip().lower(),
    )


def _generate_unique_username(db: Session, preferred_name: str, fallback_email: str) -> str:
    raw_seed = preferred_name.strip().lower() or fallback_email.split("@", 1)[0].strip().lower()
    slug = re.sub(r"[^a-z0-9]+", "-", raw_seed).strip("-") or "user"
    candidate = slug
    suffix = 1

    while db.query(User).filter(User.username == candidate).first():
        candidate = f"{slug}-{suffix}"
        suffix += 1

    return candidate


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    username = payload.username.strip().lower()
    email = payload.email.strip().lower()

    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already in use")

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")

    user = User(username=username, email=email, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    background_tasks.add_task(send_welcome_email, email, username)
    return _token_response(user)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    identifier = payload.identifier.strip().lower()
    user = db.query(User).filter((User.username == identifier) | (User.email == identifier)).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    return _token_response(user)


@router.post("/google", response_model=TokenResponse)
def login_with_google(
    payload: GoogleAuthRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    try:
        claims = verify_firebase_id_token(payload.id_token)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    email = str(claims.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google account email was not provided.")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        preferred_name = str(claims.get("name") or "").strip()
        username = _generate_unique_username(db, preferred_name=preferred_name, fallback_email=email)
        user = User(
            username=username,
            email=email,
            password_hash=hash_password(secrets.token_urlsafe(32)),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        background_tasks.add_task(send_welcome_email, email, username)

    return _token_response(user)


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(
    payload: ForgotPasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    email = payload.email.strip().lower()
    message = "If an account exists for that email, password reset instructions have been sent."
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return MessageResponse(message=message)

    reset_token = create_password_reset_token(subject=email)
    app_url = settings.frontend_app_url.strip().rstrip("/") or str(request.base_url).rstrip("/")
    reset_link = f"{app_url}/reset-password?token={reset_token}"
    try:
        send_password_reset_email(
            user.email,
            user.username or user.email,
            reset_link,
        )
    except EmailDeliveryError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    return MessageResponse(message=message)


@router.post("/forgot-username", response_model=MessageResponse)
def forgot_username(
    payload: ForgotUsernameRequest,
    db: Session = Depends(get_db),
):
    email = payload.email.strip().lower()
    message = "If an account exists for that email, a username reminder has been sent."
    user = db.query(User).filter(User.email == email).first()

    if not user or not user.username:
        return MessageResponse(message=message)

    try:
        send_username_recovery_email(user.email, user.username)
    except EmailDeliveryError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    return MessageResponse(message=message)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        email = decode_password_reset_token(payload.token).strip().lower()
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This password reset link is invalid or expired.") from exc

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.password_hash = hash_password(payload.new_password)
    db.add(user)
    db.commit()

    return MessageResponse(message="Password updated successfully. You can log in now.")
