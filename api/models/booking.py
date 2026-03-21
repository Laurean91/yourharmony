from sqlalchemy import Column, DateTime, Integer, String, func

from .base import Base


class Booking(Base):
    __tablename__ = "Booking"

    id         = Column("id", String, primary_key=True)
    parentName = Column("parentName", String, nullable=False)
    childAge   = Column("childAge", Integer, nullable=False)
    phone      = Column("phone", String, nullable=False)
    status     = Column("status", String, nullable=False, default="Новая")
    createdAt  = Column("createdAt", DateTime(timezone=True), server_default=func.now())
