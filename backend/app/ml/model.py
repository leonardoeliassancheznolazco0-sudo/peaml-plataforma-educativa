import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder
import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "peaml_model.joblib")
ENCODER_PATH = os.path.join(BASE_DIR, "peaml_encoders.joblib")
def generate_dataset(n=500):
    np.random.seed(42)
    profiles = ["TEA", "TDAH", "dislexia", "general"]
    prefs = ["visual", "auditivo", "lectura", "interactivo"]

    data = []
    for _ in range(n):
        profile = np.random.choice(profiles)
        pref = np.random.choice(prefs)
        age = np.random.randint(6, 14)
        aciertos = np.random.uniform(20, 95)
        tiempo = np.random.uniform(5, 60)
        intentos = np.random.randint(1, 10)

        if aciertos < 45 or (profile == "TEA" and aciertos < 55):
            nivel = "basico"
        elif aciertos < 70 or intentos > 6:
            nivel = "intermedio"
        else:
            nivel = "avanzado"

        data.append({
            "edad": age,
            "tipo_perfil": profile,
            "porcentaje_aciertos": round(aciertos, 2),
            "tiempo_respuesta_promedio": round(tiempo, 2),
            "intentos": intentos,
            "preferencia_contenido": pref,
            "nivel_actual": nivel,
        })
    return pd.DataFrame(data)


def train_model():
    df = generate_dataset(600)

    le_profile = LabelEncoder()
    le_pref = LabelEncoder()
    le_level = LabelEncoder()

    df["tipo_perfil_enc"] = le_profile.fit_transform(df["tipo_perfil"])
    df["preferencia_enc"] = le_pref.fit_transform(df["preferencia_contenido"])
    df["nivel_enc"] = le_level.fit_transform(df["nivel_actual"])

    features = ["edad", "tipo_perfil_enc", "porcentaje_aciertos",
                "tiempo_respuesta_promedio", "intentos", "preferencia_enc"]
    X = df[features]
    y = df["nivel_enc"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = DecisionTreeClassifier(max_depth=6, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, target_names=le_level.classes_, output_dict=True)
    cm = confusion_matrix(y_test, y_pred).tolist()

    encoders = {"profile": le_profile, "pref": le_pref, "level": le_level}

    joblib.dump(model, MODEL_PATH)
    joblib.dump(encoders, ENCODER_PATH)

    return {
        "accuracy": round(accuracy, 4),
        "classification_report": report,
        "confusion_matrix": cm,
        "classes": list(le_level.classes_),
    }


def load_model():
    if not os.path.exists(MODEL_PATH):
        train_model()
    try:
        model = joblib.load(MODEL_PATH)
        encoders = joblib.load(ENCODER_PATH)
        return model, encoders
    except Exception:
        train_model()
        model = joblib.load(MODEL_PATH)
        encoders = joblib.load(ENCODER_PATH)
        return model, encoders


def predict_level(student_data: dict) -> dict:
    model, encoders = load_model()
    le_profile = encoders["profile"]
    le_pref = encoders["pref"]
    le_level = encoders["level"]

    profile = student_data.get("cognitive_profile", "general")
    pref = student_data.get("preferencia_contenido", "visual")

    if profile not in le_profile.classes_:
        profile = "general"
    if pref not in le_pref.classes_:
        pref = "visual"

    profile_enc = le_profile.transform([profile])[0]
    pref_enc = le_pref.transform([pref])[0]

    X = np.array([[
        student_data.get("age", 9),
        profile_enc,
        student_data.get("porcentaje_aciertos", 50.0),
        student_data.get("tiempo_respuesta_promedio", 30.0),
        student_data.get("intentos", 3),
        pref_enc,
    ]])

    pred_enc = model.predict(X)[0]
    proba = model.predict_proba(X)[0]
    nivel = le_level.inverse_transform([pred_enc])[0]
    confidence = round(float(max(proba)), 4)

    return {
        "nivel_recomendado": nivel,
        "confidence": confidence,
        "perfil_detectado": profile,
    }


def get_content_recommendations(student_data: dict, contents: list) -> list:
    prediction = predict_level(student_data)
    nivel = prediction["nivel_recomendado"]
    profile = student_data.get("cognitive_profile", "general")
    pref = student_data.get("preferencia_contenido", "visual")

    scored = []
    for c in contents:
        score = 0.0
        if c.get("level") == nivel:
            score += 0.4
        if c.get("recommended_profile") == profile:
            score += 0.4
        if c.get("content_type") == pref:
            score += 0.2
        scored.append({**c, "match_score": round(score, 2)})

    scored.sort(key=lambda x: x["match_score"], reverse=True)

    # Solo recomendaciones COHERENTES: cumplen al menos 2 de 3 criterios
    # (nivel 0.4 + perfil 0.4 + tipo 0.2  ->  >= 0.6 equivale a >= 2 de 3 criterios)
    coherentes = [s for s in scored if s["match_score"] >= 0.6]
    if coherentes:
        return coherentes[:6]

    # Respaldo: si ninguna es coherente, mostrar las 3 mejores para no dejar la pantalla vacía
    return scored[:3]


if not os.path.exists(MODEL_PATH):
    try:
        train_model()
    except Exception:
        pass