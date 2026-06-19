from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Assessment
from app.models.student import Student
from app.models.user import User
from app.schemas.schemas import AssessmentCreate
from app.core.security import get_current_user, require_student

router = APIRouter()


@router.post("/")
def create_assessment(
    data: AssessmentCreate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Perfil de estudiante no encontrado")
    if student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No puedes crear evaluaciones para otro estudiante")
    if student.assessment_done and not student.assessment_unlocked:
        raise HTTPException(status_code=400, detail="Ya completaste tu evaluación inicial")

    # El PERFIL lo decide el humano: si el docente lo confirmó, su diagnóstico oficial manda
    # y el autoreporte del estudiante NO lo sobreescribe. Si no, se toma el autoreporte.
    if not student.diagnosis_confirmed:
        student.cognitive_profile = data.cognitive_profile
    student.learning_preference = data.learning_preference

    # El nivel se gana resolviendo quizzes reales; la evaluación inicial deja el nivel actual
    # como punto de partida (no se usa el árbol sintético).
    nivel_inicial = student.current_level or "basico"

    assessment = Assessment(
        student_id=data.student_id,
        score=data.score,
        response_time=data.response_time,
        attempts=data.attempts,
        cognitive_profile=student.cognitive_profile,
        learning_preference=student.learning_preference,
        predicted_level=nivel_inicial,
    )
    db.add(assessment)

    student.assessment_done = True
    student.sessions_count = (student.sessions_count or 0) + 1

    db.commit()
    db.refresh(assessment)
    return {
        "assessment_id": assessment.id,
        "predicted_level": assessment.predicted_level,
        "score": assessment.score,
        "message": "Evaluación guardada exitosamente",
    }


@router.get("/{student_id}")
def get_assessments(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == "student":
        own_student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not own_student or own_student.id != student_id:
            raise HTTPException(status_code=403, detail="Solo puedes consultar tus propias evaluaciones")

    assessments = db.query(Assessment).filter(Assessment.student_id == student_id).all()
    return assessments