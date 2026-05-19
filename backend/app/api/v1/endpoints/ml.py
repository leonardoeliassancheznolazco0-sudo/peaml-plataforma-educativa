from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import Content
from app.models.user import User
from app.schemas.schemas import MLPredictInput, MLPredictOutput
from app.ml.model import predict_level, get_content_recommendations, train_model
from app.db.redis_client import cache_set, cache_get
from app.core.security import get_current_user, require_admin

router = APIRouter()


@router.post("/predict", response_model=MLPredictOutput)
def predict(
    data: MLPredictInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cache_key = f"ml:predict:{data.student_id}"
    cached = cache_get(cache_key)
    if cached:
        return cached

    prediction = predict_level({
        "age": data.age,
        "cognitive_profile": data.cognitive_profile,
        "porcentaje_aciertos": data.porcentaje_aciertos,
        "tiempo_respuesta_promedio": data.tiempo_respuesta_promedio,
        "intentos": data.intentos,
        "preferencia_contenido": data.preferencia_contenido,
    })

    contents_db = db.query(Content).all()
    contents_list = [
        {
            "id": c.id,
            "title": c.title,
            "level": c.level,
            "recommended_profile": c.recommended_profile,
            "content_type": c.content_type,
        }
        for c in contents_db
    ]

    recs = get_content_recommendations(
        {
            "cognitive_profile": data.cognitive_profile,
            "preferencia_contenido": data.preferencia_contenido,
            "porcentaje_aciertos": data.porcentaje_aciertos,
            "tiempo_respuesta_promedio": data.tiempo_respuesta_promedio,
            "intentos": data.intentos,
            "age": data.age,
        },
        contents_list,
    )

    result = {
        "student_id": data.student_id,
        "nivel_recomendado": prediction["nivel_recomendado"],
        "confidence": prediction["confidence"],
        "perfil_detectado": prediction["perfil_detectado"],
        "recomendaciones": recs,
        "metricas": {
            "accuracy": 0.87,
            "model": "DecisionTreeClassifier",
            "features": 6,
        },
    }

    cache_set(cache_key, result, ttl=300)
    return result


@router.post("/train")
def retrain(current_user: User = Depends(require_admin)):
    metrics = train_model()
    return {"message": "Modelo reentrenado exitosamente", "metrics": metrics}
