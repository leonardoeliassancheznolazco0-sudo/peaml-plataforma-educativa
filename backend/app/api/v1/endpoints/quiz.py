from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.quiz import Question, QuizResult, QuizAnswer
from app.models.content import Content
from app.models.student import Student
from app.models.user import User
from app.schemas.schemas import (
    QuestionCreate,
    QuestionOut,
    QuestionForStudent,
    QuestionUpdate,
    QuizSubmit,
    QuizResultOut,
)
from app.ml.model import nivel_por_desempeno, NIVELES
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
    db.flush()  # para que el resultado recién guardado entre en el cálculo del nivel

    # guardar cada respuesta individual (para análisis de calidad de ítems)
    for answer in data.answers:
        sel = (answer.selected_option or "").strip().upper()
        expected = correct_map.get(answer.question_id)
        db.add(QuizAnswer(
            quiz_result_id=result.id,
            question_id=answer.question_id,
            selected_option=sel[:1] if sel else None,
            is_correct=bool(expected and sel == expected),
        ))

    # recalcular el nivel con el desempeño REAL (todos sus quizzes + el nivel de cada contenido)
    historial = (
        db.query(QuizResult.score, Content.level)
        .join(Content, Content.id == QuizResult.content_id)
        .filter(QuizResult.student_id == student.id)
        .order_by(QuizResult.created_at.asc())
        .all()
    )
    resultados = [{"score": row[0], "content_level": row[1]} for row in historial]

    nivel_anterior = student.current_level or "basico"
    nivel_nuevo = nivel_por_desempeno(resultados, nivel_anterior)
    student.current_level = nivel_nuevo
    student.sessions_count = (student.sessions_count or 0) + 1

    db.commit()
    db.refresh(result)

    def _idx(n):
        return NIVELES.index(n) if n in NIVELES else 0
    if _idx(nivel_nuevo) > _idx(nivel_anterior):
        nivel_msg = f"¡Subiste a nivel {nivel_nuevo}!"
    elif _idx(nivel_nuevo) < _idx(nivel_anterior):
        nivel_msg = f"Bajaste a nivel {nivel_nuevo}. ¡Sigue practicando!"
    else:
        nivel_msg = f"Tu nivel sigue siendo {nivel_nuevo}."

    return {
        "result": QuizResultOut.model_validate(result),
        "nivel_anterior": nivel_anterior,
        "nivel_nuevo": nivel_nuevo,
        "mensaje": f"Acertaste {correct_answers} de {total_questions} ({score}%). {nivel_msg}",
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


# ---- DOCENTE: editar una pregunta ----
@router.patch("/questions/{question_id}", response_model=QuestionOut)
def update_question(
    question_id: int,
    data: QuestionUpdate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    updates = data.dict(exclude_unset=True)
    if "correct_option" in updates:
        opt = (updates["correct_option"] or "").strip().upper()
        if opt not in {"A", "B", "C", "D"}:
            raise HTTPException(status_code=400, detail="La opción correcta debe ser A, B, C o D")
        updates["correct_option"] = opt
    for field, value in updates.items():
        setattr(question, field, value)
    db.commit()
    db.refresh(question)
    return question


# ---- DOCENTE: eliminar una pregunta ----
@router.delete("/questions/{question_id}")
def delete_question(
    question_id: int,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    db.delete(question)
    db.commit()
    return {"message": "Pregunta eliminada", "id": question_id}
