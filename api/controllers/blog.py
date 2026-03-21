from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..dependencies import get_db
from ..schemas.blog import (
    CategoryCreate,
    CategoryOut,
    PaginatedPostsOut,
    PostCreate,
    PostOut,
    PostPatch,
    PostUpdate,
)
from ..services.blog import BlogService, CategoryService


async def list_categories(db: AsyncSession = Depends(get_db)) -> list[CategoryOut]:
    service = CategoryService(db)
    categories = await service.list_categories()
    return [CategoryOut.model_validate(c) for c in categories]


async def create_category(
    data: CategoryCreate, db: AsyncSession = Depends(get_db)
) -> CategoryOut:
    async with db.begin():
        service = CategoryService(db)
        category = await service.create_category(data)
    return CategoryOut.model_validate(category)


async def list_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    published_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
) -> PaginatedPostsOut:
    service = BlogService(db)
    posts, total = await service.list_posts(
        published_only=published_only, page=page, page_size=page_size
    )
    return PaginatedPostsOut(
        items=[PostOut.model_validate(p) for p in posts],
        total=total,
        page=page,
        totalPages=max(1, (total + page_size - 1) // page_size),
    )


async def get_post(post_id: str, db: AsyncSession = Depends(get_db)) -> PostOut:
    service = BlogService(db)
    post = await service.get_post(post_id)
    return PostOut.model_validate(post)


async def get_post_by_slug(slug: str, db: AsyncSession = Depends(get_db)) -> PostOut:
    service = BlogService(db)
    post = await service.get_post_by_slug(slug)
    return PostOut.model_validate(post)


async def create_post(data: PostCreate, db: AsyncSession = Depends(get_db)) -> PostOut:
    async with db.begin():
        service = BlogService(db)
        post = await service.create_post(data)
    return PostOut.model_validate(post)


async def update_post(
    post_id: str, data: PostUpdate, db: AsyncSession = Depends(get_db)
) -> PostOut:
    async with db.begin():
        service = BlogService(db)
        post = await service.update_post(post_id, data)
    return PostOut.model_validate(post)


async def patch_post(
    post_id: str, data: PostPatch, db: AsyncSession = Depends(get_db)
) -> PostOut:
    async with db.begin():
        service = BlogService(db)
        post = await service.patch_post(post_id, data)
    return PostOut.model_validate(post)


async def delete_post(post_id: str, db: AsyncSession = Depends(get_db)) -> None:
    async with db.begin():
        service = BlogService(db)
        await service.delete_post(post_id)
