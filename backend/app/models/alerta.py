from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import uuid

class Alerta(Base):
    __tablename__ = "alertas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    estudiante_id = Column(UUID(as_uuid=True), ForeignKey("estudiantes.id"), nullable=False)
    tipo = Column(Enum("riesgo_abandono", "bajo_rendimiento", "progreso_alto", name="alerta_enum"), nullable=False)
    mensaje = Column(String, nullable=False)
    vista = Column(Boolean, default=False)
    creada_en = Column(DateTime, default=datetime.utcnow)

    estudiante = relationship("Estudiante")
