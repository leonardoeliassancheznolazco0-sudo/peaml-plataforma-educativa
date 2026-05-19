from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Content, Assessment
from app.models.student import Student
from app.models.user import User
from app.ml.model import get_content_recommendations
from app.db.redis_client import cache_set, cache_get
from app.core.security import get_current_user

router = APIRouter()


@router.get("/{student_id}")
def get_recommendations(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == "student":
        own_student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not own_student or own_student.id != student_id:
            raise HTTPException(status_code=403, detail="Solo puedes consultar tus propias recomendaciones")

    cache_key = f"recs:{student_id}"
    cached = cache_get(cache_key)
    if cached:
        return cached

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    assessments = (
        db.query(Assessment)
        .filter(Assessment.student_id == student_id)
        .order_by(Assessment.created_at.desc())
        .all()
    )
    score = assessments[0].score if assessments else 50.0
    resp_time = assessments[0].response_time if assessments else 30.0
    attempts = assessments[0].attempts if assessments else 3

    contents_db = db.query(Content).all()
    contents_list = [
        {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "level": c.level,
            "recommended_profile": c.recommended_profile,
            "content_type": c.content_type,
            "url": c.url,
        }
        for c in contents_db
    ]

    recs = get_content_recommendations(
        {
            "cognitive_profile": student.cognitive_profile or "general",
            "preferencia_contenido": student.learning_preference or "visual",
            "porcentaje_aciertos": score,
            "tiempo_respuesta_promedio": resp_time,
            "intentos": attempts,
            "age": student.age or 9,
        },
        contents_list,
    )

    cache_set(cache_key, recs, ttl=180)
    return recs
