import hashlib
import secrets
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.hashing import hash_password
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User
from app.utils.config import get_settings

settings = get_settings()


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def generate_reset_token(db: Session, user: User) -> str:
    now = datetime.now(UTC)

    existing_tokens = db.scalars(
        select(PasswordResetToken).where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used_at.is_(None),
        )
    ).all()

    for token in existing_tokens:
        token.used_at = now

    raw_token = secrets.token_urlsafe(32)
    expires_at = now + timedelta(minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES)

    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=_token_hash(raw_token),
            expires_at=expires_at,
        )
    )
    db.commit()

    return raw_token


def reset_password(db: Session, raw_token: str, new_password: str) -> None:
    now = datetime.now(UTC)
    token_record = db.scalar(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == _token_hash(raw_token),
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at >= now,
        )
    )

    if not token_record:
        raise ValueError("Invalid or expired reset token")

    user = db.get(User, token_record.user_id)
    if not user:
        raise ValueError("User not found for this reset token")

    user.hashed_password = hash_password(new_password)
    token_record.used_at = now
    db.commit()
