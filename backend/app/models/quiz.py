from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, Text, Float, Boolean
from app.db.database import Base


class Question(Base):
    """Una pregunta de opción múltiple ligada a un contenido."""
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(Integer, ForeignKey("contents.id"), nullable=False)
    text = Column(Text, nullable=False)
    option_a = Column(String(300), nullable=False)
    option_b = Column(String(300), nullable=False)
    option_c = Column(String(300), nullable=False)
    option_d = Column(String(300), nullable=False)
    correct_option = Column(String(1), nullable=False)   # "A" | "B" | "C" | "D"
    created_at = Column(DateTime, server_default=func.now())


class QuizResult(Base):
    """Resultado REAL de un test resuelto por un estudiante.
    Esta tabla es la fuente de datos reales que alimenta al modelo de ML."""
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    content_id = Column(Integer, ForeignKey("contents.id"), nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    score = Column(Float, nullable=False)         # 0-100, % real de aciertos
    time_seconds = Column(Float, nullable=False)  # tiempo real que tardó
    created_at = Column(DateTime, server_default=func.now())


class QuizAnswer(Base):
    """Respuesta individual a una pregunta dentro de un intento.
    Permite el análisis de calidad de ítems (índice de discriminación)."""
    __tablename__ = "quiz_answers"

    id = Column(Integer, primary_key=True, index=True)
    quiz_result_id = Column(Integer, ForeignKey("quiz_results.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    selected_option = Column(String(1))           # "A" | "B" | "C" | "D"
    is_correct = Column(Boolean, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
