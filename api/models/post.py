"""
SQLAlchemy models mapped to existing Prisma-managed tables.

CRITICAL: Prisma creates columns with the exact camelCase names from the schema.
Every Column must explicitly specify the DB column name as first positional argument.
Table names match Prisma model names verbatim (e.g. "Post", "Category").
"""

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import relationship

from .base import Base


class Category(Base):
    __tablename__ = "Category"

    id = Column("id", String, primary_key=True)
    name = Column("name", String, nullable=False, unique=True)
    slug = Column("slug", String, nullable=False, unique=True)
    createdAt = Column("createdAt", DateTime(timezone=True), server_default=func.now())

    posts = relationship("Post", back_populates="category", lazy="raise")


class Post(Base):
    __tablename__ = "Post"

    id = Column("id", String, primary_key=True)
    title = Column("title", String, nullable=False)
    slug = Column("slug", String, nullable=False, unique=True)
    excerpt = Column("excerpt", Text)
    content = Column("content", Text, nullable=False)
    coverImage = Column("coverImage", String)
    isPublished = Column("isPublished", Boolean, default=False, nullable=False)
    categoryId = Column(
        "categoryId", String, ForeignKey("Category.id"), nullable=True
    )
    createdAt = Column("createdAt", DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(
        "updatedAt", DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    category = relationship("Category", back_populates="posts", lazy="raise")
