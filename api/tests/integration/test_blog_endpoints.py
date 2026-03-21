"""Integration tests for /api/v1/blog endpoints."""

import pytest
from httpx import AsyncClient

from api.models.post import Category, Post


class TestBlogPublicEndpoints:
    """Public endpoints (no auth required)."""

    async def test_list_posts_empty(self, client: AsyncClient):
        resp = await client.get("/api/v1/blog/posts")
        assert resp.status_code == 200
        body = resp.json()
        assert "items" in body
        assert "total" in body
        assert "page" in body
        assert "totalPages" in body

    async def test_list_posts_published_only(
        self, client: AsyncClient, post: Post
    ):
        resp = await client.get("/api/v1/blog/posts?published_only=true")
        assert resp.status_code == 200
        ids = [p["id"] for p in resp.json()["items"]]
        assert post.id in ids

    async def test_get_post_by_id(self, client: AsyncClient, post: Post):
        resp = await client.get(f"/api/v1/blog/posts/{post.id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == post.id
        assert resp.json()["title"] == post.title

    async def test_get_post_not_found(self, client: AsyncClient):
        resp = await client.get("/api/v1/blog/posts/nonexistent-id-xyz")
        assert resp.status_code == 404

    async def test_get_post_by_slug(self, client: AsyncClient, post: Post):
        resp = await client.get(f"/api/v1/blog/posts/slug/{post.slug}")
        assert resp.status_code == 200
        assert resp.json()["slug"] == post.slug

    async def test_get_post_by_slug_not_found(self, client: AsyncClient):
        resp = await client.get("/api/v1/blog/posts/slug/no-such-slug")
        assert resp.status_code == 404

    async def test_list_categories(self, client: AsyncClient, category: Category):
        resp = await client.get("/api/v1/blog/categories")
        assert resp.status_code == 200
        slugs = [c["slug"] for c in resp.json()]
        assert category.slug in slugs


class TestBlogAdminEndpoints:
    """Admin endpoints — require auth header."""

    async def test_create_post_unauthenticated_returns_401(self, client: AsyncClient):
        resp = await client.post(
            "/api/v1/blog/posts",
            json={"title": "X", "slug": "x", "content": "Y"},
        )
        assert resp.status_code == 401

    async def test_create_post_success(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.post(
            "/api/v1/blog/posts",
            json={
                "title": "New Post",
                "slug": "new-post",
                "content": "Content of the post",
                "isPublished": False,
            },
            headers=auth_headers,
        )
        assert resp.status_code == 201
        body = resp.json()
        assert body["slug"] == "new-post"
        assert body["isPublished"] is False
        assert "id" in body

    async def test_create_post_invalid_slug_returns_422(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.post(
            "/api/v1/blog/posts",
            json={"title": "X", "slug": "INVALID SLUG!", "content": "Y"},
            headers=auth_headers,
        )
        assert resp.status_code == 422

    async def test_create_post_missing_content_returns_422(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.post(
            "/api/v1/blog/posts",
            json={"title": "X", "slug": "x"},
            headers=auth_headers,
        )
        assert resp.status_code == 422

    async def test_create_duplicate_slug_returns_409(
        self, client: AsyncClient, auth_headers: dict, post: Post
    ):
        resp = await client.post(
            "/api/v1/blog/posts",
            json={"title": "Duplicate", "slug": post.slug, "content": "Content"},
            headers=auth_headers,
        )
        assert resp.status_code == 409

    async def test_patch_post_publish(
        self, client: AsyncClient, auth_headers: dict, post: Post
    ):
        resp = await client.patch(
            f"/api/v1/blog/posts/{post.id}",
            json={"isPublished": True},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["isPublished"] is True

    async def test_delete_post(
        self, client: AsyncClient, auth_headers: dict, post: Post
    ):
        resp = await client.delete(
            f"/api/v1/blog/posts/{post.id}",
            headers=auth_headers,
        )
        assert resp.status_code == 204
        # Verify deleted
        get_resp = await client.get(f"/api/v1/blog/posts/{post.id}")
        assert get_resp.status_code == 404

    async def test_delete_nonexistent_post_returns_404(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.delete(
            "/api/v1/blog/posts/nonexistent-id",
            headers=auth_headers,
        )
        assert resp.status_code == 404

    async def test_create_category(
        self, client: AsyncClient, auth_headers: dict
    ):
        resp = await client.post(
            "/api/v1/blog/categories",
            json={"name": "Music", "slug": "music"},
            headers=auth_headers,
        )
        assert resp.status_code == 201
        assert resp.json()["slug"] == "music"
