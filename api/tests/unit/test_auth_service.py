"""Unit tests for AuthService — no DB, no HTTP."""

import os
import time

import pytest
from fastapi import HTTPException
from jose import jwt

os.environ.setdefault("ADMIN_USER", "admin")
os.environ.setdefault("ADMIN_PASSWORD", "testpass")
os.environ.setdefault("BLOG_BOT_USER", "blogbot")
os.environ.setdefault("BLOG_BOT_PASSWORD", "blogbotpass")
os.environ.setdefault("FASTAPI_SECRET_KEY", "test-secret-key-for-pytest-only")
os.environ.setdefault("FASTAPI_DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

from api.config import settings
from api.services.auth import AuthService  # noqa: E402


class TestAuthenticate:
    def test_correct_admin_credentials_returns_admin_subject(self):
        assert AuthService.authenticate("admin", "testpass") == "admin"

    def test_correct_blog_bot_credentials_returns_blog_bot_subject(self):
        assert AuthService.authenticate("blogbot", "blogbotpass") == "blog_bot"

    def test_wrong_password_returns_none(self):
        assert AuthService.authenticate("admin", "wrongpass") is None

    def test_wrong_username_returns_none(self):
        assert AuthService.authenticate("root", "testpass") is None

    def test_empty_credentials_returns_none(self):
        assert AuthService.authenticate("", "") is None

    def test_admin_password_does_not_authenticate_as_blog_bot_username(self):
        assert AuthService.authenticate("blogbot", "testpass") is None

    def test_blog_bot_password_does_not_authenticate_as_admin_username(self):
        assert AuthService.authenticate("admin", "blogbotpass") is None

    def test_unset_blog_bot_credentials_do_not_authenticate_empty_login(self, monkeypatch):
        monkeypatch.setattr(settings, "BLOG_BOT_USER", "")
        monkeypatch.setattr(settings, "BLOG_BOT_PASSWORD", "")
        assert AuthService.authenticate("", "") is None


class TestCreateAccessToken:
    def test_token_is_string(self):
        token = AuthService.create_access_token()
        assert isinstance(token, str)
        assert len(token) > 20

    def test_token_payload_type_is_access(self):
        token = AuthService.create_access_token()
        payload = jwt.decode(
            token,
            "test-secret-key-for-pytest-only",
            algorithms=["HS256"],
        )
        assert payload["type"] == "access"
        assert payload["sub"] == "admin"

    def test_token_has_future_expiry(self):
        token = AuthService.create_access_token()
        payload = jwt.decode(
            token,
            "test-secret-key-for-pytest-only",
            algorithms=["HS256"],
        )
        assert payload["exp"] > time.time()


class TestCreateRefreshToken:
    def test_refresh_token_type(self):
        token = AuthService.create_refresh_token()
        payload = jwt.decode(
            token,
            "test-secret-key-for-pytest-only",
            algorithms=["HS256"],
        )
        assert payload["type"] == "refresh"

    def test_refresh_token_expires_later_than_access(self):
        access = AuthService.create_access_token()
        refresh = AuthService.create_refresh_token()
        access_exp = jwt.decode(
            access, "test-secret-key-for-pytest-only", algorithms=["HS256"]
        )["exp"]
        refresh_exp = jwt.decode(
            refresh, "test-secret-key-for-pytest-only", algorithms=["HS256"]
        )["exp"]
        assert refresh_exp > access_exp


class TestVerifyAccessToken:
    def test_valid_token_returns_payload(self):
        token = AuthService.create_access_token()
        payload = AuthService.verify_access_token(token)
        assert payload["sub"] == "admin"
        assert payload["type"] == "access"

    def test_invalid_token_raises_401(self):
        with pytest.raises(HTTPException) as exc_info:
            AuthService.verify_access_token("not.a.valid.token")
        assert exc_info.value.status_code == 401

    def test_refresh_token_rejected_as_access(self):
        """A refresh token must not be accepted as an access token."""
        refresh = AuthService.create_refresh_token()
        with pytest.raises(HTTPException) as exc_info:
            AuthService.verify_access_token(refresh)
        assert exc_info.value.status_code == 401

    def test_tampered_token_raises_401(self):
        token = AuthService.create_access_token()
        tampered = token[:-5] + "XXXXX"
        with pytest.raises(HTTPException) as exc_info:
            AuthService.verify_access_token(tampered)
        assert exc_info.value.status_code == 401


class TestVerifyRefreshToken:
    def test_valid_refresh_token_returns_payload(self):
        token = AuthService.create_refresh_token()
        payload = AuthService.verify_refresh_token(token)
        assert payload["type"] == "refresh"

    def test_access_token_rejected_as_refresh(self):
        access = AuthService.create_access_token()
        with pytest.raises(HTTPException) as exc_info:
            AuthService.verify_refresh_token(access)
        assert exc_info.value.status_code == 401
