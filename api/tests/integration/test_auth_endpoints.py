"""Integration tests for /api/v1/auth endpoints."""

import pytest
from httpx import AsyncClient


class TestLogin:
    async def test_login_valid_credentials_returns_tokens(self, client: AsyncClient):
        resp = await client.post(
            "/api/v1/auth/login",
            json={"username": "admin", "password": "testpass"},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert "access_token" in body
        assert "refresh_token" in body
        assert body["token_type"] == "bearer"

    async def test_login_wrong_password_returns_401(self, client: AsyncClient):
        resp = await client.post(
            "/api/v1/auth/login",
            json={"username": "admin", "password": "wrongpassword"},
        )
        assert resp.status_code == 401

    async def test_login_wrong_username_returns_401(self, client: AsyncClient):
        resp = await client.post(
            "/api/v1/auth/login",
            json={"username": "hacker", "password": "testpass"},
        )
        assert resp.status_code == 401

    async def test_login_missing_fields_returns_422(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/login", json={})
        assert resp.status_code == 422

    async def test_login_empty_password_returns_422(self, client: AsyncClient):
        resp = await client.post(
            "/api/v1/auth/login",
            json={"username": "admin", "password": ""},
        )
        assert resp.status_code == 422


class TestRefresh:
    async def test_refresh_with_valid_token(self, client: AsyncClient):
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"username": "admin", "password": "testpass"},
        )
        refresh_token = login_resp.json()["refresh_token"]

        resp = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    async def test_refresh_with_access_token_returns_401(self, client: AsyncClient):
        """Access token must be rejected as a refresh token."""
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"username": "admin", "password": "testpass"},
        )
        access_token = login_resp.json()["access_token"]

        resp = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": access_token},
        )
        assert resp.status_code == 401

    async def test_refresh_with_garbage_returns_401(self, client: AsyncClient):
        resp = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "not.a.valid.token"},
        )
        assert resp.status_code == 401
