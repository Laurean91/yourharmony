from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models.post import Category, Post


class CategoryRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_all(self) -> list[Category]:
        result = await self.db.execute(select(Category).order_by(Category.name))
        return list(result.scalars().all())

    async def get_by_id(self, category_id: str) -> Category | None:
        return await self.db.get(Category, category_id)

    async def get_by_slug(self, slug: str) -> Category | None:
        result = await self.db.execute(
            select(Category).where(Category.slug == slug)
        )
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> Category:
        category = Category(**data)
        self.db.add(category)
        await self.db.flush()
        await self.db.refresh(category)
        return category


class PostRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_all(
        self,
        *,
        published_only: bool = False,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Post], int]:
        base_q = select(Post)
        if published_only:
            base_q = base_q.where(Post.isPublished == True)  # noqa: E712

        count_q = select(func.count()).select_from(base_q.subquery())
        total = (await self.db.scalar(count_q)) or 0

        data_q = (
            base_q.options(selectinload(Post.category))
            .order_by(Post.createdAt.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await self.db.execute(data_q)
        return list(result.scalars().all()), total

    async def get_by_id(self, post_id: str) -> Post | None:
        result = await self.db.execute(
            select(Post)
            .options(selectinload(Post.category))
            .where(Post.id == post_id)
        )
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Post | None:
        result = await self.db.execute(
            select(Post)
            .options(selectinload(Post.category))
            .where(Post.slug == slug)
        )
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> Post:
        post = Post(**data)
        self.db.add(post)
        await self.db.flush()
        result = await self.db.execute(
            select(Post)
            .options(selectinload(Post.category))
            .where(Post.id == post.id)
        )
        return result.scalar_one()

    async def update(self, post: Post, data: dict) -> Post:
        for key, value in data.items():
            setattr(post, key, value)
        await self.db.flush()
        result = await self.db.execute(
            select(Post)
            .options(selectinload(Post.category))
            .where(Post.id == post.id)
        )
        return result.scalar_one()

    async def delete(self, post: Post) -> None:
        await self.db.delete(post)
        await self.db.flush()
