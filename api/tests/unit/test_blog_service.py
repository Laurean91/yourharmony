"""Unit tests for BlogService and CategoryService — mocked repositories."""

import os
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest
from fastapi import HTTPException

os.environ.setdefault("ADMIN_USER", "admin")
os.environ.setdefault("ADMIN_PASSWORD", "testpass")
os.environ.setdefault("FASTAPI_SECRET_KEY", "test-secret-key-for-pytest-only")
os.environ.setdefault("FASTAPI_DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

from api.schemas.blog import CategoryCreate, PostCreate, PostPatch, PostUpdate  # noqa: E402
from api.services.blog import BlogService, CategoryService  # noqa: E402


def make_mock_post(slug="test-post", published=True) -> MagicMock:
    post = MagicMock()
    post.id = str(uuid4())
    post.slug = slug
    post.isPublished = published
    post.category = None
    return post


def make_mock_category(slug="tech") -> MagicMock:
    cat = MagicMock()
    cat.id = str(uuid4())
    cat.slug = slug
    cat.name = "Tech"
    return cat


# ── CategoryService ───────────────────────────────────────────────────────────

class TestCategoryService:
    @pytest.fixture
    def mock_db(self):
        return AsyncMock()

    async def test_create_category_success(self, mock_db):
        with patch("api.services.blog.CategoryRepository") as MockRepo:
            repo = MockRepo.return_value
            repo.get_by_slug = AsyncMock(return_value=None)
            repo.create = AsyncMock(return_value=make_mock_category())

            service = CategoryService(mock_db)
            result = await service.create_category(CategoryCreate(name="Tech", slug="tech"))

            repo.create.assert_called_once()
            assert result is not None

    async def test_create_category_duplicate_slug_raises_409(self, mock_db):
        with patch("api.services.blog.CategoryRepository") as MockRepo:
            repo = MockRepo.return_value
            repo.get_by_slug = AsyncMock(return_value=make_mock_category())

            service = CategoryService(mock_db)
            with pytest.raises(HTTPException) as exc_info:
                await service.create_category(CategoryCreate(name="Tech", slug="tech"))
            assert exc_info.value.status_code == 409


# ── BlogService ───────────────────────────────────────────────────────────────

class TestBlogServiceGetPost:
    @pytest.fixture
    def mock_db(self):
        return AsyncMock()

    async def test_get_existing_post_returns_post(self, mock_db):
        mock_post = make_mock_post()
        with patch("api.services.blog.PostRepository") as MockRepo:
            MockRepo.return_value.get_by_id = AsyncMock(return_value=mock_post)
            service = BlogService(mock_db)
            result = await service.get_post(mock_post.id)
        assert result is mock_post

    async def test_get_nonexistent_post_raises_404(self, mock_db):
        with patch("api.services.blog.PostRepository") as MockRepo:
            MockRepo.return_value.get_by_id = AsyncMock(return_value=None)
            service = BlogService(mock_db)
            with pytest.raises(HTTPException) as exc_info:
                await service.get_post("nonexistent-id")
        assert exc_info.value.status_code == 404

    async def test_get_post_by_slug_not_found_raises_404(self, mock_db):
        with patch("api.services.blog.PostRepository") as MockRepo:
            MockRepo.return_value.get_by_slug = AsyncMock(return_value=None)
            service = BlogService(mock_db)
            with pytest.raises(HTTPException) as exc_info:
                await service.get_post_by_slug("no-such-slug")
        assert exc_info.value.status_code == 404


class TestBlogServiceCreate:
    @pytest.fixture
    def mock_db(self):
        return AsyncMock()

    async def test_create_post_success(self, mock_db):
        mock_post = make_mock_post()
        with patch("api.services.blog.PostRepository") as MockRepo:
            repo = MockRepo.return_value
            repo.get_by_slug = AsyncMock(return_value=None)
            repo.create = AsyncMock(return_value=mock_post)

            service = BlogService(mock_db)
            data = PostCreate(title="Hi", slug="hi", content="Body text here")
            result = await service.create_post(data)

        assert result is mock_post

    async def test_create_post_duplicate_slug_raises_409(self, mock_db):
        with patch("api.services.blog.PostRepository") as MockRepo:
            MockRepo.return_value.get_by_slug = AsyncMock(return_value=make_mock_post())
            service = BlogService(mock_db)
            data = PostCreate(title="Hi", slug="hi", content="Body")
            with pytest.raises(HTTPException) as exc_info:
                await service.create_post(data)
        assert exc_info.value.status_code == 409


class TestBlogServiceUpdate:
    @pytest.fixture
    def mock_db(self):
        return AsyncMock()

    async def test_update_nonexistent_post_raises_404(self, mock_db):
        with patch("api.services.blog.PostRepository") as MockRepo:
            MockRepo.return_value.get_by_id = AsyncMock(return_value=None)
            service = BlogService(mock_db)
            data = PostUpdate(title="X", slug="x", content="Y")
            with pytest.raises(HTTPException) as exc_info:
                await service.update_post("bad-id", data)
        assert exc_info.value.status_code == 404

    async def test_patch_excludes_unset_fields(self, mock_db):
        """PATCH must only update the fields the caller provided."""
        mock_post = make_mock_post(slug="original-slug")
        updated_post = make_mock_post(slug="original-slug", published=True)
        updated_post.isPublished = True

        with patch("api.services.blog.PostRepository") as MockRepo:
            repo = MockRepo.return_value
            repo.get_by_id = AsyncMock(return_value=mock_post)
            repo.update = AsyncMock(return_value=updated_post)

            service = BlogService(mock_db)
            result = await service.patch_post(mock_post.id, PostPatch(isPublished=True))

        # Verify update was called with only isPublished
        call_kwargs = repo.update.call_args[0][1]
        assert "isPublished" in call_kwargs
        assert "slug" not in call_kwargs  # not provided in patch

    async def test_delete_nonexistent_raises_404(self, mock_db):
        with patch("api.services.blog.PostRepository") as MockRepo:
            MockRepo.return_value.get_by_id = AsyncMock(return_value=None)
            service = BlogService(mock_db)
            with pytest.raises(HTTPException) as exc_info:
                await service.delete_post("bad-id")
        assert exc_info.value.status_code == 404
