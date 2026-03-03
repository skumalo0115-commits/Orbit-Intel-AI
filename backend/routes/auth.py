from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.models.user import User
from backend.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from backend.services.email import send_welcome_email
from backend.services.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    username = payload.username.strip().lower()

    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already in use")

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")

    user = User(username=username, email=payload.email, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()

    background_tasks.add_task(send_welcome_email, payload.email, username)

    token = create_access_token(subject=username)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    username = payload.username.strip().lower()
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(subject=username)
    return TokenResponse(access_token=token)
