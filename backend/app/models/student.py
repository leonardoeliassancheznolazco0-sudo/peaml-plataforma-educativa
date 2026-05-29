from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, func
from app.db.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    age = Column(Integer, nullable=True)
    cognitive_profile = Column(String(50), default="general")
    learning_preference = Column(String(50), default="visual")
    current_level = Column(String(20), default="basico")
    total_score = Column(Float, default=0.0)
    sessions_count = Column(Integer, default=0)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
