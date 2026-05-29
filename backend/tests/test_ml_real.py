import sys
import os
import importlib.util

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

spec = importlib.util.spec_from_file_location(
    "ml_model",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "app", "ml", "model.py")
)
ml_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ml_module)
train_model = ml_module.train_model
load_model = ml_module.load_model

from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, classification_report, confusion_matrix
)

def test_modelo_se_entrena():
    train_model()
    model, encoders = load_model()
    assert model is not None
    assert encoders is not None
    print("\n  Modelo cargado correctamente")

def test_modelo_metricas_reales():
    model, encoders = load_model()

    datos_prueba = [
        {"age": 9,  "cognitive_profile": "TEA",      "preferencia_contenido": "visual",      "porcentaje_aciertos": 85.0, "tiempo_respuesta_promedio": 12.0, "intentos": 2, "nivel_real": "avanzado"},
        {"age": 10, "cognitive_profile": "TDAH",     "preferencia_contenido": "interactivo", "porcentaje_aciertos": 60.0, "tiempo_respuesta_promedio": 18.0, "intentos": 4, "nivel_real": "intermedio"},
        {"age": 8,  "cognitive_profile": "dislexia", "preferencia_contenido": "auditivo",    "porcentaje_aciertos": 35.0, "tiempo_respuesta_promedio": 22.0, "intentos": 5, "nivel_real": "basico"},
        {"age": 11, "cognitive_profile": "TEA",      "preferencia_contenido": "visual",      "porcentaje_aciertos": 90.0, "tiempo_respuesta_promedio": 10.0, "intentos": 2, "nivel_real": "avanzado"},
        {"age": 9,  "cognitive_profile": "TDAH",     "preferencia_contenido": "interactivo", "porcentaje_aciertos": 65.0, "tiempo_respuesta_promedio": 15.0, "intentos": 3, "nivel_real": "intermedio"},
        {"age": 10, "cognitive_profile": "general",  "preferencia_contenido": "lectura",     "porcentaje_aciertos": 80.0, "tiempo_respuesta_promedio": 13.0, "intentos": 2, "nivel_real": "avanzado"},
        {"age": 11, "cognitive_profile": "TEA",      "preferencia_contenido": "visual",      "porcentaje_aciertos": 95.0, "tiempo_respuesta_promedio": 8.0,  "intentos": 1, "nivel_real": "avanzado"},
        {"age": 9,  "cognitive_profile": "general",  "preferencia_contenido": "visual",      "porcentaje_aciertos": 88.0, "tiempo_respuesta_promedio": 11.0, "intentos": 2, "nivel_real": "avanzado"},
        {"age": 11, "cognitive_profile": "general",  "preferencia_contenido": "lectura",     "porcentaje_aciertos": 40.0, "tiempo_respuesta_promedio": 9.0,  "intentos": 1, "nivel_real": "basico"},
        {"age": 8,  "cognitive_profile": "dislexia", "preferencia_contenido": "auditivo",    "porcentaje_aciertos": 30.0, "tiempo_respuesta_promedio": 28.0, "intentos": 7, "nivel_real": "basico"},
    ]

    le_profile = encoders["profile"]
    le_pref    = encoders["pref"]
    le_nivel   = encoders["level"]

    y_real = []
    y_pred = []

    for d in datos_prueba:
        try:
            profile_enc = le_profile.transform([d["cognitive_profile"]])[0]
            pref_enc    = le_pref.transform([d["preferencia_contenido"]])[0]
            X = [[d["age"], profile_enc, d["porcentaje_aciertos"],
                  d["tiempo_respuesta_promedio"], d["intentos"], pref_enc]]
            pred = model.predict(X)[0]
            pred_label = le_nivel.inverse_transform([pred])[0]
            y_real.append(d["nivel_real"])
            y_pred.append(pred_label)
        except Exception as e:
            print(f"\n  Error en prediccion: {e}")

    acc  = accuracy_score(y_real, y_pred)
    prec = precision_score(y_real, y_pred, average="weighted", zero_division=0)
    rec  = recall_score(y_real, y_pred, average="weighted", zero_division=0)
    f1   = f1_score(y_real, y_pred, average="weighted", zero_division=0)

    print(f"\n  === METRICAS REALES DEL MODELO PEAML ===")
    print(f"  Accuracy:  {acc*100:.1f}%")
    print(f"  Precision: {prec*100:.1f}%")
    print(f"  Recall:    {rec*100:.1f}%")
    print(f"  F1-Score:  {f1*100:.1f}%")
    print(f"\n{classification_report(y_real, y_pred, zero_division=0)}")
    print(f"  Matriz de confusion:\n{confusion_matrix(y_real, y_pred)}")

    assert acc >= 0.70
    assert prec >= 0.70