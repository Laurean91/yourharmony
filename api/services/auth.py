from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from jose import JWTError, jwt

from ..config import settings


class AuthService:
    @staticmethod
    def authenticate(username: str, password: str) -> str | None:
        """Validate credentials against env-configured identities.

        Returns the matched identity's token subject, or None if no
        identity matches. Two identities never share a subject, so a
        leaked BLOG_BOT credential cannot mint an "admin" token.
        """
        if username == settings.ADMIN_USER and password == settings.ADMIN_PASSWORD:
            return "admin"
        if (
            settings.BLOG_BOT_USER
            and settings.BLOG_BOT_PASSWORD
            and username == settings.BLOG_BOT_USER
            and password == settings.BLOG_BOT_PASSWORD
        ):
            return "blog_bot"
        return None

    @staticmethod
    def create_access_token(subject: str = "admin") -> str:
        exp = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
        return jwt.encode(
            {"sub": subject, "exp": exp, "type": "access"},
            settings.FASTAPI_SECRET_KEY,
            algorithm=settings.ALGORITHM,
        )

    @staticmethod
    def create_refresh_token(subject: str = "admin") -> str:
        exp = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
        return jwt.encode(
            {"sub": subject, "exp": exp, "type": "refresh"},
            settings.FASTAPI_SECRET_KEY,
            algorithm=settings.ALGORITHM,
        )

    @staticmethod
    def verify_access_token(token: str) -> dict:
        """Decode and validate access token. Raises HTTP 401 on failure."""
        try:
            payload = jwt.decode(
                token,
                settings.FASTAPI_SECRET_KEY,
                algorithms=[settings.ALGORITHM],
            )
            if payload.get("type") != "access":
                raise ValueError("invalid token type")
            return payload
        except (JWTError, ValueError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

    @staticmethod
    def verify_refresh_token(token: str) -> dict:
        """Decode and validate refresh token. Raises HTTP 401 on failure."""
        try:
            payload = jwt.decode(
                token,
                settings.FASTAPI_SECRET_KEY,
                algorithms=[settings.ALGORITHM],
            )
            if payload.get("type") != "refresh":
                raise ValueError("invalid token type")
            return payload
        except (JWTError, ValueError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
            )
