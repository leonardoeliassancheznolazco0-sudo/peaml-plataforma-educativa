from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from datetime import datetime
import uuid

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    contrasena = Column(String, nullable=False)
    rol = Column(Enum("alumno", "docente", "padre", name="rol_enum"), nullable=False)
    nombre = Column(String, nullable=False)
    creado_en = Column(DateTime, default=datetime.utcnow)git add .
