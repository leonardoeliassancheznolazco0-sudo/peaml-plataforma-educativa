from sqlalchemy import Column, String, Integer, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class Estudiante(Base):
    __tablename__ = "estudiantes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    grado = Column(String, nullable=False)
    condicion = Column(Enum("TEA", "TDAH", "Dislexia", "Discalculia", "Mixto", name="condicion_enum"), nullable=False)
    estilo_aprendizaje = Column(Enum("visual", "auditivo", "kinestesico", "mixto", name="estilo_enum"), nullable=False)
    nivel_actual = Column(Integer, default=1)
    docente_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=True)

    usuario = relationship("Usuario", foreign_keys=[usuario_id])
    docente = relationship("Usuario", foreign_keys=[docente_id])
