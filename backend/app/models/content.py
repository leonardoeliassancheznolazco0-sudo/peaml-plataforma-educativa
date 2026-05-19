from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func, Text
from app.db.database import Base


class Content(Base):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    content_type = Column(String(50))
    level = Column(String(20))
    recommended_profile = Column(String(50))
    url = Column(String(500))
    created_at = Column(DateTime, server_default=func.now())


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    score = Column(Float)
    response_time = Column(Float)
    attempts = Column(Integer, default=1)
    cognitive_profile = Column(String(50))
    learning_preference = Column(String(50))
    predicted_level = Column(String(20))
    created_at = Column(DateTime, server_default=func.now())


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    content_id = Column(Integer, ForeignKey("contents.id"))
    reason = Column(String(300))
    score = Column(Float, default=0.0)
    created_at = Column(DateTime, server_default=func.now())
