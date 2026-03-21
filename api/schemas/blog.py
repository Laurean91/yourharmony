from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    slug: str = Field(min_length=1, max_length=100, pattern=r"^[a-z0-9-]+$")


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    id: str
    createdAt: datetime

    model_config = {"from_attributes": True}


class PostBase(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    slug: str = Field(min_length=1, max_length=500, pattern=r"^[a-z0-9-]+$")
    excerpt: Optional[str] = None
    content: str = Field(min_length=1)
    coverImage: Optional[str] = None
    isPublished: bool = False
    categoryId: Optional[str] = None


class PostCreate(PostBase):
    pass


class PostUpdate(PostBase):
    pass


class PostPatch(BaseModel):
    """Partial update — all fields optional."""

    title: Optional[str] = Field(None, min_length=1, max_length=500)
    slug: Optional[str] = Field(None, min_length=1, max_length=500, pattern=r"^[a-z0-9-]+$")
    excerpt: Optional[str] = None
    content: Optional[str] = Field(None, min_length=1)
    coverImage: Optional[str] = None
    isPublished: Optional[bool] = None
    categoryId: Optional[str] = None


class PostOut(PostBase):
    id: str
    createdAt: datetime
    updatedAt: datetime
    category: Optional[CategoryOut] = None

    model_config = {"from_attributes": True}


class PaginatedPostsOut(BaseModel):
    items: list[PostOut]
    total: int
    page: int
    totalPages: int
