import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, classification_report, confusion_matrix
)
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import numpy as np

# ── Dataset de prueba representativo del proyecto ─────────────────────────────
data = [
    # age, profile, preference, pct_aciertos, tiempo, intentos, nivel
    (9,  "TEA",      "visual",       0.85, 12.0, 2, "basico"),
    (10, "TDAH",     "interactivo",  0.60, 18.0, 4, "basico"),
    (8,  "dislexia", "auditivo",     0.45, 22.0, 5, "basico"),
    (11, "TEA",      "visual",       0.90, 10.0, 2, "intermedio"),
    (9,  "TDAH",     "interactivo",  0.75, 15.0, 3, "intermedio"),
    (10, "general",  "lectura",      0.80, 13.0, 2, "intermedio"),
    (8,  "dislexia", "auditivo",     0.55, 20.0, 4, "basico"),
    (11, "TEA",      "visual",       0.95, 8.0,  1, "avanzado"),
    (9,  "general",  "visual",       0.88, 11.0, 2, "avanzado"),
    (10, "TDAH",     "interactivo",  0.70, 16.0, 3, "intermedio"),
    (8,  "TEA",      "visual",       0.40, 25.0, 6, "basico"),
    (11, "general",  "lectura",      0.92, 9.0,  1, "avanzado"),
    (9,  "dislexia", "auditivo",     0.50, 21.0, 5, "basico"),
    (10, "TEA",      "visual",       0.78, 14.0, 3, "intermedio"),
    (8,  "TDAH",     "interactivo",  0.65, 17.0, 4, "intermedio"),
    (11, "general",  "lectura",      0.85, 12.0, 2, "avanzado"),
    (9,  "dislexia", "auditivo",     0.35, 28.0, 7, "basico"),
    (10, "TEA",      "visual",       0.93, 9.0,  1, "avanzado"),
    (8,  "general",  "visual",       0.72, 15.0, 3, "intermedio"),
    (11, "TDAH",     "interactivo",  0.88, 11.0, 2, "avanzado"),
    (9,  "TEA",      "visual",       0.55, 19.0, 5, "basico"),
    (10, "dislexia", "lectura",      0.68, 16.0, 4, "intermedio"),
    (8,  "general",  "visual",       0.82, 13.0, 2, "intermedio"),
    (11, "TEA",      "visual",       0.97, 7.0,  1, "avanzado"),
]

le_profile   = LabelEncoder()
le_pref      = LabelEncoder()
le_nivel     = LabelEncoder()

perfiles     = le_profile.fit_transform([d[1] for d in data])
preferencias = le_pref.fit_transform([d[2] for d in data])
niveles      = le_nivel.fit_transform([d[6] for d in data])

X = np.array([
    [d[0], perfiles[i], preferencias[i], d[3], d[4], d[5]]
    for i, d in enumerate(data)
])
y = niveles

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42
)

modelo = DecisionTreeClassifier(random_state=42)
modelo.fit(X_train, y_train)
y_pred = modelo.predict(X_test)

labels_text = le_nivel.classes_

# ── Tests ─────────────────────────────────────────────────────────────────────
def test_accuracy_minimo():
    acc = accuracy_score(y_test, y_pred)
    print(f"\n  Accuracy: {acc*100:.1f}%")
    assert acc >= 0.70

def test_precision_minimo():
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    print(f"\n  Precision: {prec*100:.1f}%")
    assert prec >= 0.70

def test_recall_minimo():
    rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    print(f"\n  Recall: {rec*100:.1f}%")
    assert rec >= 0.70

def test_f1_minimo():
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    print(f"\n  F1-Score: {f1*100:.1f}%")
    assert f1 >= 0.70

def test_classification_report():
    report = classification_report(y_test, y_pred,
                                   target_names=labels_text,
                                   zero_division=0)
    print(f"\n{report}")
    assert report is not None

def test_cobertura_perfiles():
    perfiles_unicos = set(d[1] for d in data)
    assert "TEA"      in perfiles_unicos
    assert "TDAH"     in perfiles_unicos
    assert "dislexia" in perfiles_unicos
    assert "general"  in perfiles_unicos
    print(f"\n  Perfiles cubiertos: {perfiles_unicos}")

def test_matriz_confusion():
    cm = confusion_matrix(y_test, y_pred)
    print(f"\n  Matriz de confusion:\n{cm}")
    assert cm.shape[0] == cm.shape[1]