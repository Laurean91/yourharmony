from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.post import Category, Post
from ..repositories.blog import CategoryRepository, PostRepository
from ..schemas.blog import (
    CategoryCreate,
    PostCreate,
    PostPatch,
    PostUpdate,
)


class CategoryService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = CategoryRepository(db)

    async def list_categories(self) -> list[Category]:
        return await self.repo.get_all()

    async def create_category(self, data: CategoryCreate) -> Category:
        existing = await self.repo.get_by_slug(data.slug)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Category with slug '{data.slug}' already exists",
            )
        return await self.repo.create(
            {"id": str(uuid4()), "name": data.name, "slug": data.slug}
        )


class BlogService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = PostRepository(db)

    async def list_posts(
        self,
        *,
        published_only: bool = False,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Post], int]:
        return await self.repo.get_all(
            published_only=published_only, page=page, page_size=page_size
        )

    async def get_post(self, post_id: str) -> Post:
        post = await self.repo.get_by_id(post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        return post

    async def get_post_by_slug(self, slug: str) -> Post:
        post = await self.repo.get_by_slug(slug)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        return post

    async def create_post(self, data: PostCreate) -> Post:
        existing = await self.repo.get_by_slug(data.slug)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Post with slug '{data.slug}' already exists",
            )
        return await self.repo.create(
            {
                "id": str(uuid4()),
                **data.model_dump(),
            }
        )

    async def update_post(self, post_id: str, data: PostUpdate) -> Post:
        post = await self.repo.get_by_id(post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        # Check slug uniqueness if slug changed
        if data.slug != post.slug:
            existing = await self.repo.get_by_slug(data.slug)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Post with slug '{data.slug}' already exists",
                )
        return await self.repo.update(post, data.model_dump())

    async def patch_post(self, post_id: str, data: PostPatch) -> Post:
        post = await self.repo.get_by_id(post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        updates = data.model_dump(exclude_unset=True)
        if "slug" in updates and updates["slug"] != post.slug:
            existing = await self.repo.get_by_slug(updates["slug"])
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Post with slug '{updates['slug']}' already exists",
                )
        return await self.repo.update(post, updates)

    async def delete_post(self, post_id: str) -> None:
        post = await self.repo.get_by_id(post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        await self.repo.delete(post)
