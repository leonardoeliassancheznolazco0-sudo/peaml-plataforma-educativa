from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.content import Content
from app.models.user import User
from app.schemas.schemas import ContentCreate, ContentOut
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