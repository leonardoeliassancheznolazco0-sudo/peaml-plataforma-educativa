from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ---- Auth ----
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


# ---- User ----
class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ---- Student ----
class StudentOut(BaseModel):
    id: int
    user_id: int
    age: Optional[int]
    cognitive_profile: Optional[str]
    learning_preference: Optional[str]
    current_level: Optional[str]
    total_score: Optional[float]
    sessions_count: Optional[int]

    class Config:
        from_attributes = True


# ---- Assessment ----
class AssessmentCreate(BaseModel):
    student_id: int
    score: float
    response_time: float
    attempts: int
    cognitive_profile: str
    learning_preference: str


class AssessmentOut(BaseModel):
    id: int
    student_id: int
    score: float
    response_time: float
    attempts: int
    predicted_level: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ---- Content ----
class ContentCreate(BaseModel):
    title: str
    description: str
    content_type: str
    level: str
    recommended_profile: str
    url: Optional[str] = ""


class ContentOut(BaseModel):
    id: int
    title: str
    description: str
    content_type: str
    level: str
    recommended_profile: str
    url: Optional[str]

    class Config:
        from_attributes = True


# ---- ML ----
class MLPredictInput(BaseModel):
    student_id: int
    age: int
    cognitive_profile: str
    porcentaje_aciertos: float
    tiempo_respuesta_promedio: float
    intentos: int
    preferencia_contenido: str


class MLPredictOutput(BaseModel):
    student_id: int
    nivel_recomendado: str
    confidence: float
    perfil_detectado: str
    recomendaciones: List[dict]
    metricas: dict


# ---- Quiz: preguntas ----
class QuestionCreate(BaseModel):
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str  # "A" | "B" | "C" | "D"


class QuestionOut(BaseModel):
    """Versión completa para el DOCENTE: incluye la respuesta correcta."""
    id: int
    content_id: int
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str

    class Config:
        from_attributes = True


class QuestionForStudent(BaseModel):
    """Versión para el ESTUDIANTE: SIN la respuesta correcta (para que no haga trampa)."""
    id: int
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str

    class Config:
        from_attributes = True


# ---- Quiz: envío y resultado ----
class QuizAnswer(BaseModel):
    question_id: int
    selected_option: str  # "A" | "B" | "C" | "D"


class QuizSubmit(BaseModel):
    content_id: int
    answers: List[QuizAnswer]
    time_seconds: float


class QuizResultOut(BaseModel):
    id: int
    student_id: int
    content_id: int
    total_questions: int
    correct_answers: int
    score: float
    time_seconds: float

    class Config:
        from_attributes = True