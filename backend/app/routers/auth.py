from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hashear_contrasena, verificar_contrasena, crear_token
from app.models.usuario import Usuario
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])

class RegisterRequest(BaseModel):
    nombre: str
    email: str
    contrasena: str
    rol: str

class LoginRequest(BaseModel):
    email: str
    contrasena: str

@router.post("/register")
def register(datos: RegisterRequest, db: Session = Depends(get_db)):
    usuario_existente = db.query(Usuario).filter(Usuario.email == datos.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    nuevo_usuario = Usuario(
        nombre=datos.nombre,
        email=datos.email,
        contrasena=hashear_contrasena(datos.contrasena),
        rol=datos.rol
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return {"mensaje": "Usuario creado exitosamente", "id": str(nuevo_usuario.id)}

@router.post("/login")
def login(datos: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == datos.email).first()
    if not usuario:
        raise HTTPException(status_code=400, detail="Email o contraseña incorrectos")
    if not verificar_contrasena(datos.contrasena, usuario.contrasena):
        raise HTTPException(status_code=400, detail="Email o contraseña incorrectos")
    
    token = crear_token({"sub": str(usuario.id), "rol": usuario.rol})
    return {"token": token, "rol": usuario.rol, "nombre": usuario.nombre}
