from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Assessment
from app.models.student import Student
from app.models.user import User
from app.schemas.schemas import AssessmentCreate
from app.ml.model import predict_level
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

    prediction = predict_level({
        "age": student.age or 9,
        "cognitive_profile": data.cognitive_profile,
        "porcentaje_aciertos": data.score,
        "tiempo_respuesta_promedio": data.response_time,
        "intentos": data.attempts,
        "preferencia_contenido": data.learning_preference,
    })

    assessment = Assessment(
        student_id=data.student_id,
        score=data.score,
        response_time=data.response_time,
        attempts=data.attempts,
        cognitive_profile=data.cognitive_profile,
        learning_preference=data.learning_preference,
        predicted_level=prediction["nivel_recomendado"],
    )
    db.add(assessment)

    student.cognitive_profile = data.cognitive_profile
    student.learning_preference = data.learning_preference
    student.current_level = prediction["nivel_recomendado"]
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