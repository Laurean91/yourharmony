from sqlalchemy import Column, DateTime, Integer, String, func
from sqlalchemy.orm import relationship

from .base import Base


class Student(Base):
    __tablename__ = "Student"

    id = Column("id", String, primary_key=True)
    name = Column("name", String, nullable=False)
    age = Column("age", Integer)
    phone = Column("phone", String)
    tag = Column("tag", String, nullable=False, default="Индивидуальное")
    notes = Column("notes", String)
    createdAt = Column("createdAt", DateTime(timezone=True), server_default=func.now())

    lesson_students = relationship(
        "LessonStudent", back_populates="student", lazy="raise"
    )
