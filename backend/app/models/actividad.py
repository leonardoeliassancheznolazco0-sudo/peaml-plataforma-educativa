from sqlalchemy import Column, String, Integer, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import uuid

class Actividad(Base):
    __tablename__ = "actividades"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    titulo = Column(String, nullable=False)
    tipo = Column(Enum("lectura", "video", "ejercicio", "audio", "juego", name="tipo_enum"), nullable=False)
    modalidad = Column(Enum("visual", "auditivo", "kinestesico", "mixto", name="modalidad_enum"), nullable=False)
    nivel = Column(Integer, nullable=False)
    condicion_objetivo = Column(String, nullable=False)
    url_contenido = Column(String, nullable=True)
    duracion_min = Column(Integer, nullable=False)
