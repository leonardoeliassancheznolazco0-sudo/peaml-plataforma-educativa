from sqlalchemy import Column, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import uuid

class SesionAprendizaje(Base):
    __tablename__ = "sesiones_aprendizaje"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    estudiante_id = Column(UUID(as_uuid=True), ForeignKey("estudiantes.id"), nullable=False)
    actividad_id = Column(UUID(as_uuid=True), ForeignKey("actividades.id"), nullable=False)
    inicio = Column(DateTime, default=datetime.utcnow)
    fin = Column(DateTime, nullable=True)
    tiempo_segundos = Column(Integer, nullable=True)
    intentos = Column(Integer, default=1)
    aciertos = Column(Integer, default=0)
    completada = Column(Boolean, default=False)
    puntuacion = Column(Float, default=0.0)

    estudiante = relationship("Estudiante")
    actividad = relationship("Actividad")
