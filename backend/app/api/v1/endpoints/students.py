from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.student import Student
from app.models.user import User
from app.models.content import Assessment
from app.core.security import get_current_user, require_teacher, require_student

router = APIRouter()


@router.get("/me")
def get_my_student_profile(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Perfil de estudiante no encontrado")

    assessments = db.query(Assessment).filter(Assessment.student_id == student.id).all()
    avg_score = (
        round(sum(a.score for a in assessments) / len(assessments), 1)
        if assessments else 0.0
    )

    return {
        "id": student.id,
        "user_id": student.user_id,
        "name": current_user.name,
        "email": current_user.email,
        "age": student.age,
        "cognitive_profile": student.cognitive_profile,
        "learning_preference": student.learning_preference,
        "current_level": student.current_level,
        "total_score": avg_score,
        "sessions_count": len(assessments),
    }


@router.get("/")
def list_students(
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    students = db.query(Student).all()
    result = []
    for s in students:
        user = db.query(User).filter(User.id == s.user_id).first()
        assessments = db.query(Assessment).filter(Assessment.student_id == s.id).all()
        avg_score = (
            round(sum(a.score for a in assessments) / len(assessments), 1)
            if assessments else 0.0
        )
        result.append({
            "id": s.id,
            "name": user.name if user else "N/A",
            "email": user.email if user else "N/A",
            "age": s.age,
            "cognitive_profile": s.cognitive_profile,
            "learning_preference": s.learning_preference,
            "current_level": s.current_level,
            "total_score": avg_score,
            "sessions_count": len(assessments),
        })
    return result


@router.get("/{student_id}")
def get_student(
    student_id: int,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    user = db.query(User).filter(User.id == student.user_id).first()
    return {
        "id": student.id,
        "name": user.name if user else "N/A",
        "email": user.email if user else "N/A",
        "age": student.age,
        "cognitive_profile": student.cognitive_profile,
        "learning_preference": student.learning_preference,
        "current_level": student.current_level,
    }