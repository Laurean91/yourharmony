from sqlalchemy import Column, String, func, DateTime

from .base import Base


class SiteSettings(Base):
    __tablename__ = "SiteSettings"

    key = Column("key", String, primary_key=True)
    value = Column("value", String, nullable=False)
    updatedAt = Column("updatedAt", DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
