from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.content import Content
from app.models.quiz import Question, QuizResult
from app.models.user import User
from app.schemas.schemas import ContentCreate, ContentOut, ContentUpdate
from app.core.security import require_teacher

router = APIRouter()


@router.get("/", response_model=List[ContentOut])
def list_contents(db: Session = Depends(get_db)):
    return db.query(Content).all()


@router.post("/", response_model=ContentOut)
def create_content(
    data: ContentCreate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    content = Content(**data.dict())
    db.add(content)
    db.commit()
    db.refresh(content)
    return content


@router.patch("/{content_id}", response_model=ContentOut)
def update_content(
    content_id: int,
    data: ContentUpdate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Contenido no encontrado")
    for field, value in data.dict(exclude_unset=True).items():
        setattr(content, field, value)
    db.commit()
    db.refresh(content)
    return content


@router.delete("/{content_id}")
def delete_content(
    content_id: int,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Contenido no encontrado")
    # borrar primero lo que depende del contenido (preguntas y resultados)
    db.query(Question).filter(Question.content_id == content_id).delete()
    db.query(QuizResult).filter(QuizResult.content_id == content_id).delete()
    db.delete(content)
    db.commit()
    return {"message": "Contenido eliminado", "id": content_id}