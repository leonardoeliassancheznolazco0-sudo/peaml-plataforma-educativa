from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.db.database import get_db
from app.models.user import User
from app.models.student import Student
from app.core.security import get_password_hash, require_admin, require_teacher, get_current_user

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────────
class CreateTeacherRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class CreateStudentRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    age: int
    cognitive_profile: str
    learning_preference: str
    current_level: str = "basico"


class UpdateStudentRequest(BaseModel):
    age: Optional[int] = None
    cognitive_profile: Optional[str] = None
    learning_preference: Optional[str] = None
    current_level: Optional[str] = None


# ── Admin: crear docente ──────────────────────────────────────────────────────
@router.post("/admin/teachers")
def create_teacher(
    data: CreateTeacherRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")

    teacher = User(
        name=data.name,
        email=data.email,
        password_hash=get_password_hash(data.password),
        role="teacher",
        status="active",
        created_by=current_user.id,
    )
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return {"message": "Docente creado exitosamente", "id": teacher.id}


# ── Admin: listar docentes ────────────────────────────────────────────────────
@router.get("/admin/teachers")
def list_teachers(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    teachers = db.query(User).filter(User.role == "teacher").all()
    return [
        {
            "id": t.id,
            "name": t.name,
            "email": t.email,
            "status": t.status,
            "created_at": str(t.created_at),
        }
        for t in teachers
    ]


# ── Admin: activar/desactivar usuario ────────────────────────────────────────
@router.patch("/admin/users/{user_id}/status")
def update_user_status(
    user_id: int,
    status: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if status not in ["active", "inactive", "trial"]:
        raise HTTPException(status_code=400, detail="Estado inválido")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if user.role == "admin":
        raise HTTPException(status_code=403, detail="No puedes modificar un administrador")

    user.status = status
    db.commit()
    return {"message": f"Usuario {status}", "id": user_id}


# ── Admin: listar usuarios trial ──────────────────────────────────────────────
@router.get("/admin/users/trial")
def list_trial_users(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    users = db.query(User).filter(User.status == "trial").all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "created_at": str(u.created_at),
        }
        for u in users
    ]


# ── Docente: crear estudiante ─────────────────────────────────────────────────
@router.post("/teacher/students")
def create_student(
    data: CreateStudentRequest,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")

    user = User(
        name=data.name,
        email=data.email,
        password_hash=get_password_hash(data.password),
        role="student",
        status="active",
        created_by=current_user.id,
    )
    db.add(user)
    db.flush()

    student = Student(
        user_id=user.id,
        age=data.age,
        cognitive_profile=data.cognitive_profile,
        learning_preference=data.learning_preference,
        current_level=data.current_level,
        assigned_by=current_user.id,
    )
    db.add(student)
    db.commit()
    db.refresh(user)
    return {"message": "Estudiante creado exitosamente", "id": user.id}


# ── Docente: actualizar perfil de estudiante ──────────────────────────────────
@router.patch("/teacher/students/{student_id}")
def update_student_profile(
    student_id: int,
    data: UpdateStudentRequest,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    if data.age is not None:
        student.age = data.age
    if data.cognitive_profile is not None:
        student.cognitive_profile = data.cognitive_profile
    if data.learning_preference is not None:
        student.learning_preference = data.learning_preference
    if data.current_level is not None:
        student.current_level = data.current_level

    db.commit()
    return {"message": "Perfil actualizado exitosamente"}
