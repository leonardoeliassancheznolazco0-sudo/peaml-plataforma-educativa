from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, func, Boolean
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
    diagnosis_confirmed = Column(Boolean, default=False)  # el docente confirmó el diagnóstico oficial
    assessment_done = Column(Boolean, default=False)      # ya completó la evaluación inicial
    assessment_unlocked = Column(Boolean, default=False)  # modo dev: permite repetir la evaluación infinitas veces
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
