from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.student import Student
from app.models.content import Content
from app.models.quiz import Question, QuizResult, QuizAnswer
from app.ml.model import UMBRAL_ALERTA_PROMEDIO, calidad_item
from app.core.security import require_teacher

router = APIRouter()


@router.get("/student-alerts")
def student_alerts(
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    """Estudiantes que necesitan apoyo (promedio bajo o reprobando seguido).
    Docente ve a SUS estudiantes; admin ve a todos."""
    q = db.query(User).filter(User.role == "student")
    if current_user.role == "teacher":
        q = q.filter(User.created_by == current_user.id)
    usuarios = q.all()

    alertas = []
    for u in usuarios:
        student = db.query(Student).filter(Student.user_id == u.id).first()
        if not student:
            continue
        scores = [
            r[0] for r in (
                db.query(QuizResult.score)
                .filter(QuizResult.student_id == student.id)
                .order_by(QuizResult.created_at.asc())
                .all()
            )
        ]
        if not scores:
            continue
        promedio = round(sum(scores) / len(scores), 1)
        motivos = []
        if promedio < UMBRAL_ALERTA_PROMEDIO:
            motivos.append(f"Promedio bajo ({promedio}%)")
        if len(scores) >= 2 and all(s < 50 for s in scores[-2:]):
            motivos.append("Reprobó sus últimos 2 quizzes")
        if motivos:
            alertas.append({
                "student_id": student.id,
                "name": u.name,
                "email": u.email,
                "nivel": student.current_level,
                "promedio": promedio,
                "total_quizzes": len(scores),
                "motivos": motivos,
            })
    return alertas


@router.get("/item-quality")
def item_quality(
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    """Calidad de cada pregunta (dificultad y discriminación) a partir de las
    respuestas reales. Las marcadas como 'mala' son la alerta para docente/admin."""
    items = []
    total_malos = 0
    for qn in db.query(Question).all():
        filas = (
            db.query(QuizResult.score, QuizAnswer.is_correct)
            .join(QuizAnswer, QuizAnswer.quiz_result_id == QuizResult.id)
            .filter(QuizAnswer.question_id == qn.id)
            .all()
        )
        respuestas = [{"score": f[0], "is_correct": bool(f[1])} for f in filas]
        calidad = calidad_item(respuestas)
        if calidad["mala"]:
            total_malos += 1
        content = db.query(Content).filter(Content.id == qn.content_id).first()
        items.append({
            "question_id": qn.id,
            "content_id": qn.content_id,
            "content_title": content.title if content else None,
            "text": qn.text,
            **calidad,
        })
    return {"items": items, "total_malos": total_malos}
