from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.student import Student
from app.models.content import Content, Assessment
from app.core.security import get_current_user, require_teacher, require_admin

router = APIRouter()


@router.get("/student/{student_id}")
def student_dashboard(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == "student":
        own_student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not own_student or own_student.id != student_id:
            raise HTTPException(status_code=403, detail="Solo puedes consultar tu propio dashboard")

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    user = db.query(User).filter(User.id == student.user_id).first()
    assessments = db.query(Assessment).filter(Assessment.student_id == student_id).all()

    scores = [a.score for a in assessments]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0

    return {
        "student_id": student_id,
        "name": user.name if user else "Estudiante",
        "cognitive_profile": student.cognitive_profile,
        "learning_preference": student.learning_preference,
        "current_level": student.current_level,
        "sessions_count": len(assessments),
        "avg_score": avg_score,
        "progress": [
            {"session": i + 1, "score": a.score, "date": str(a.created_at)}
            for i, a in enumerate(assessments[-5:])
        ],
    }


@router.get("/teacher")
def teacher_dashboard(
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    students = db.query(Student).all()
    assessments = db.query(Assessment).all()

    result = []
    for s in students:
        user = db.query(User).filter(User.id == s.user_id).first()
        s_assessments = [a for a in assessments if a.student_id == s.id]
        scores = [a.score for a in s_assessments]
        avg = round(sum(scores) / len(scores), 1) if scores else 0
        result.append({
            "id": s.id,
            "name": user.name if user else "N/A",
            "profile": s.cognitive_profile,
            "level": s.current_level,
            "avg_score": avg,
            "sessions": len(s_assessments),
            "needs_help": avg < 50 and len(s_assessments) > 0,
        })

    return {
        "total_students": len(result),
        "avg_class_score": round(sum(r["avg_score"] for r in result) / len(result), 1) if result else 0,
        "students_needing_help": sum(1 for r in result if r["needs_help"]),
        "students": result,
    }


@router.get("/admin")
def admin_dashboard(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return {
        "total_users": db.query(User).count(),
        "total_students": db.query(Student).count(),
        "total_contents": db.query(Content).count(),
        "total_assessments": db.query(Assessment).count(),
        "users_by_role": {
            "students": db.query(User).filter(User.role == "student").count(),
            "teachers": db.query(User).filter(User.role == "teacher").count(),
            "admins": db.query(User).filter(User.role == "admin").count(),
        },
        "system_status": {
            "backend": "online",
            "database": "connected",
            "ml_model": "loaded",
        },
    }
