from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
import uuid

class ResultadoML(Base):
    __tablename__ = "resultados_ml"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    estudiante_id = Column(UUID(as_uuid=True), ForeignKey("estudiantes.id"), nullable=False)
    modelo = Column(String, nullable=False)
    prediccion = Column(JSON, nullable=False)
    generado_en = Column(DateTime, default=datetime.utcnow)

    estudiante = relationship("Estudiante")
