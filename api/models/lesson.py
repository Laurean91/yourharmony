from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, String, func
from sqlalchemy.orm import relationship

from .base import Base


class Lesson(Base):
    __tablename__ = "Lesson"

    id = Column("id", String, primary_key=True)
    date = Column("date", DateTime(timezone=True), nullable=False)
    title = Column("title", String)
    tag = Column("tag", String, nullable=False, default="Индивидуальное")
    notes = Column("notes", String)
    price = Column("price", Float)
    createdAt = Column("createdAt", DateTime(timezone=True), server_default=func.now())

    lesson_students = relationship(
        "LessonStudent",
        back_populates="lesson",
        lazy="raise",
        cascade="all, delete-orphan",
    )


class LessonStudent(Base):
    """Junction table: composite PK (lessonId, studentId) — mirrors Prisma @@id."""

    __tablename__ = "LessonStudent"

    lessonId = Column(
        "lessonId",
        String,
        ForeignKey("Lesson.id", ondelete="CASCADE"),
        primary_key=True,
    )
    studentId = Column(
        "studentId",
        String,
        ForeignKey("Student.id", ondelete="CASCADE"),
        primary_key=True,
    )
    attended = Column("attended", Boolean, nullable=False, default=False)

    lesson = relationship("Lesson", back_populates="lesson_students", lazy="raise")
    student = relationship("Student", back_populates="lesson_students", lazy="raise")
