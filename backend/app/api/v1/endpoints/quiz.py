from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.quiz import Question, QuizResult
from app.models.content import Content
from app.models.student import Student
from app.models.user import User
from app.schemas.schemas import (
    QuestionCreate,
    QuestionOut,
    QuestionForStudent,
    QuizSubmit,
    QuizResultOut,
)
from app.ml.model import predict_level
from app.core.security import get_current_user, require_student, require_teacher

router = APIRouter()


# ---- DOCENTE: agregar una pregunta a un contenido ----
@router.post("/contents/{content_id}/questions", response_model=QuestionOut)
def add_question(
    content_id: int,
    data: QuestionCreate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Contenido no encontrado")

    option = (data.correct_option or "").strip().upper()
    if option not in {"A", "B", "C", "D"}:
        raise HTTPException(status_code=400, detail="La opción correcta debe ser A, B, C o D")

    question = Question(
        content_id=content_id,
        text=data.text,
        option_a=data.option_a,
        option_b=data.option_b,
        option_c=data.option_c,
        option_d=data.option_d,
        correct_option=option,
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


# ---- DOCENTE: listar preguntas (CON respuesta correcta, para gestión) ----
@router.get("/contents/{content_id}/questions", response_model=list[QuestionOut])
def list_questions(
    content_id: int,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    return db.query(Question).filter(Question.content_id == content_id).all()


# ---- ESTUDIANTE: obtener el quiz (SIN respuestas correctas) ----
@router.get("/contents/{content_id}/quiz", response_model=list[QuestionForStudent])
def get_quiz(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    questions = db.query(Question).filter(Question.content_id == content_id).all()
    if not questions:
        raise HTTPException(status_code=404, detail="Este contenido todavía no tiene preguntas")
    return questions


# ---- ESTUDIANTE: enviar respuestas y recibir puntaje REAL ----
@router.post("/submit")
def submit_quiz(
    data: QuizSubmit,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Perfil de estudiante no encontrado")

    questions = db.query(Question).filter(Question.content_id == data.content_id).all()
    if not questions:
        raise HTTPException(status_code=404, detail="Este contenido no tiene preguntas")

    # mapa  id_pregunta -> respuesta correcta
    correct_map = {q.id: q.correct_option.strip().upper() for q in questions}

    # contar aciertos comparando lo que respondió el alumno con la clave
    correct_answers = 0
    for answer in data.answers:
        expected = correct_map.get(answer.question_id)
        if expected and (answer.selected_option or "").strip().upper() == expected:
            correct_answers += 1

    total_questions = len(questions)
    score = round(correct_answers / total_questions * 100, 1)

    # guardar el resultado REAL (esto es lo que alimentará al ML)
    result = QuizResult(
        student_id=student.id,
        content_id=data.content_id,
        total_questions=total_questions,
        correct_answers=correct_answers,
        score=score,
        time_seconds=data.time_seconds,
    )
    db.add(result)

    # actualizar el nivel del estudiante usando el puntaje REAL
    prediction = predict_level({
        "age": student.age or 9,
        "cognitive_profile": student.cognitive_profile or "general",
        "porcentaje_aciertos": score,
        "tiempo_respuesta_promedio": round(data.time_seconds / total_questions, 2),
        "intentos": 1,
        "preferencia_contenido": student.learning_preference or "visual",
    })
    student.current_level = prediction["nivel_recomendado"]
    student.sessions_count = (student.sessions_count or 0) + 1

    db.commit()
    db.refresh(result)

    return {
        "result": QuizResultOut.model_validate(result),
        "nivel_nuevo": prediction["nivel_recomendado"],
        "confianza": prediction.get("confidence"),
        "mensaje": f"Acertaste {correct_answers} de {total_questions} ({score}%)",
    }


# ---- ESTUDIANTE/DOCENTE: historial de resultados ----
@router.get("/results/{student_id}", response_model=list[QuizResultOut])
def get_results(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == "student":
        own_student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not own_student or own_student.id != student_id:
            raise HTTPException(status_code=403, detail="Solo puedes consultar tus propios resultados")

    return (
        db.query(QuizResult)
        .filter(QuizResult.student_id == student_id)
        .order_by(QuizResult.created_at.desc())
        .all()
    )
