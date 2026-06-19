from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.models.content import Content, Assessment
from app.models.quiz import QuizResult
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

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    # el caché incluye el nivel para refrescar cuando el estudiante sube/baja
    cache_key = f"recs:{student_id}:{student.current_level or 'basico'}:{student.cognitive_profile or 'general'}"
    cached = cache_get(cache_key)
    if cached:
        return cached

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

    # Retroalimentación real: promedio de score por contenido entre estudiantes del MISMO perfil
    filas = (
        db.query(QuizResult.content_id, func.avg(QuizResult.score))
        .join(Student, Student.id == QuizResult.student_id)
        .filter(Student.cognitive_profile == (student.cognitive_profile or "general"))
        .group_by(QuizResult.content_id)
        .all()
    )
    rendimiento = {cid: float(avg) for cid, avg in filas}

    recs = get_content_recommendations(
        {
            "cognitive_profile": student.cognitive_profile or "general",
            "preferencia_contenido": student.learning_preference or "visual",
            "current_level": student.current_level or "basico",
        },
        contents_list,
        rendimiento,
    )

    cache_set(cache_key, recs, ttl=180)
    return recs
