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