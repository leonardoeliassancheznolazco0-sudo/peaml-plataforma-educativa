import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.cluster import KMeans
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


def get_content_recommendations(student_data: dict, contents: list, rendimiento_por_contenido: dict = None) -> list:
    """
    Recomendador híbrido (regla + retroalimentación real):
      - Coherencia: 0.4 nivel + 0.4 perfil + 0.2 tipo (preferencia)  -> match_score
      - Componente ML: ajusta el orden con el desempeño REAL de estudiantes del mismo perfil
        en cada contenido (rendimiento_por_contenido = {content_id: promedio_score 0-100}).
      - Incluye el contenido más fácil del SIGUIENTE nivel como "reto para subir".
    """
    rendimiento = rendimiento_por_contenido or {}
    nivel = student_data.get("current_level") or "basico"
    profile = student_data.get("cognitive_profile", "general")
    pref = student_data.get("preferencia_contenido", "visual")

    scored = []
    for c in contents:
        match = 0.0
        if c.get("level") == nivel:
            match += 0.4
        if c.get("recommended_profile") == profile:
            match += 0.4
        if c.get("content_type") == pref:
            match += 0.2
        avg_real = rendimiento.get(c.get("id"))                  # promedio real de estudiantes parecidos
        fit = (avg_real / 100.0) if avg_real is not None else None
        ranking = match + (0.2 * fit if fit is not None else 0.0)   # empujón por desempeño real
        scored.append({
            **c,
            "match_score": round(match, 2),
            "fit_real": round(fit, 2) if fit is not None else None,
            "ranking": round(ranking, 3),
            "reto": False,
        })

    # Coherentes (>=2 de 3 criterios), ordenadas por ranking (coherencia + ML)
    coherentes = [s for s in scored if s["match_score"] >= 0.6]
    coherentes.sort(key=lambda x: x["ranking"], reverse=True)
    base = coherentes[:6] if coherentes else sorted(scored, key=lambda x: x["ranking"], reverse=True)[:3]

    # Reto del siguiente nivel
    reto = _reto_siguiente_nivel(nivel, contents, profile, rendimiento, base)
    if reto:
        base = base + [reto]

    return base


def _reto_siguiente_nivel(nivel, contents, profile, rendimiento, ya_incluidos):
    """Devuelve el contenido más fácil del nivel siguiente como 'reto para subir', o None."""
    if nivel not in NIVELES or NIVELES.index(nivel) >= len(NIVELES) - 1:
        return None
    siguiente = NIVELES[NIVELES.index(nivel) + 1]
    candidatos = [c for c in contents if c.get("level") == siguiente]
    mismo_perfil = [c for c in candidatos if c.get("recommended_profile") == profile]
    candidatos = mismo_perfil or candidatos
    if not candidatos:
        return None
    # "más fácil" = mayor promedio real entre estudiantes; sin datos queda al final del orden
    candidatos.sort(key=lambda c: rendimiento.get(c.get("id"), -1), reverse=True)
    elegido = candidatos[0]
    if elegido.get("id") in {c.get("id") for c in ya_incluidos}:
        return None
    avg = rendimiento.get(elegido.get("id"))
    return {
        **elegido,
        "match_score": 0.6,
        "fit_real": round(avg / 100.0, 2) if avg is not None else None,
        "ranking": 0.6,
        "reto": True,
    }


# =====================================================================
#  Nivel dinámico a partir del desempeño REAL (progresión por reto)
# =====================================================================

# --- Parámetros del nivel (los que el profesor podrá "viviseccionar") ---
NIVELES = ["basico", "intermedio", "avanzado"]
UMBRAL_APROBAR = 70.0          # score >= se considera aprobado
UMBRAL_REPROBAR = 50.0         # score < se considera reprobado
FALLAS_PARA_BAJAR = 2          # reprobadas seguidas en el nivel actual para bajar
MIN_APROBADAS_PARA_SUBIR = 2   # quizzes aprobados de un nivel para poder subir a él


def nivel_por_desempeno(resultados, nivel_actual="basico"):
    """
    Calcula el nivel del estudiante a partir de su desempeño REAL.

    resultados: lista de dicts {"content_level": "basico|intermedio|avanzado", "score": 0-100},
                ordenados del más antiguo al más reciente.
    Regla (progresión por reto):
      - Un quiz se aprueba si score >= UMBRAL_APROBAR.
      - Para SUBIR a un nivel hay que aprobar al menos MIN_APROBADAS_PARA_SUBIR quizzes
        de contenido de ESE nivel (no basta con aprobar uno). Básico es el piso.
      - Si reprueba (score < UMBRAL_REPROBAR) FALLAS_PARA_BAJAR veces seguidas en su nivel
        actual, baja un nivel.
    """
    if not resultados:
        return nivel_actual

    # 1) contar quizzes APROBADOS por nivel de contenido
    aprobadas = {n: 0 for n in NIVELES}
    for r in resultados:
        if r.get("score", 0) >= UMBRAL_APROBAR:
            cl = r.get("content_level")
            if cl in aprobadas:
                aprobadas[cl] += 1

    # 2) nivel = el más alto que alcance el mínimo de aprobadas (básico es el piso)
    nivel_idx = 0
    for i in range(len(NIVELES) - 1, 0, -1):
        if aprobadas[NIVELES[i]] >= MIN_APROBADAS_PARA_SUBIR:
            nivel_idx = i
            break

    # 3) ¿baja? fallas consecutivas recientes en el nivel calculado
    nivel_str = NIVELES[nivel_idx]
    consecutivas = 0
    for r in reversed(resultados):
        if r.get("content_level") != nivel_str:
            continue
        if r.get("score", 0) < UMBRAL_REPROBAR:
            consecutivas += 1
        else:
            break
    if consecutivas >= FALLAS_PARA_BAJAR and nivel_idx > 0:
        nivel_idx -= 1

    return NIVELES[nivel_idx]


# =====================================================================
#  Alertas y calidad de ítems (analítica honesta sobre datos reales)
# =====================================================================

# --- Parámetros (viviseccionables) ---
UMBRAL_ALERTA_PROMEDIO = 50.0   # promedio de score por debajo -> alerta de apoyo
UMBRAL_DISCRIMINACION = 0.2     # índice de discriminación por debajo -> ítem de baja calidad
MIN_RESPUESTAS_ITEM = 5         # respuestas mínimas para evaluar una pregunta


def calidad_item(respuestas):
    """
    Análisis clásico de ítems sobre respuestas reales.
    respuestas: lista de dicts {"score": score_del_intento, "is_correct": bool}.
    Calcula:
      - dificultad (p-value): proporción de aciertos (0=muy difícil, 1=muy fácil).
      - discriminación: % aciertos del grupo de mejor desempeño menos el del grupo bajo.
        (una buena pregunta la aciertan más los que saben más).
    Marca la pregunta como 'mala' si casi todos aciertan/fallan o si discrimina poco.
    Si hay menos de MIN_RESPUESTAS_ITEM respuestas, no juzga (datos insuficientes).
    """
    n = len(respuestas)
    if n < MIN_RESPUESTAS_ITEM:
        return {"n": n, "dificultad": None, "discriminacion": None, "mala": False, "motivo": "datos insuficientes"}

    correctas = sum(1 for r in respuestas if r["is_correct"])
    dificultad = correctas / n

    ordenadas = sorted(respuestas, key=lambda r: r.get("score", 0))
    mitad = max(1, n // 2)
    bajo = ordenadas[:mitad]
    alto = ordenadas[-mitad:]
    p_alto = sum(1 for r in alto if r["is_correct"]) / len(alto)
    p_bajo = sum(1 for r in bajo if r["is_correct"]) / len(bajo)
    discriminacion = round(p_alto - p_bajo, 2)

    base = {"n": n, "dificultad": round(dificultad, 2), "discriminacion": discriminacion}
    if dificultad >= 0.95:
        return {**base, "mala": True, "motivo": "casi todos aciertan (muy fácil)"}
    if dificultad <= 0.05:
        return {**base, "mala": True, "motivo": "casi todos fallan (revisar)"}
    if discriminacion < UMBRAL_DISCRIMINACION:
        return {**base, "mala": True, "motivo": "baja discriminación"}
    return {**base, "mala": False, "motivo": "ok"}


# =====================================================================
#  Clustering de estudiantes (K-Means, no supervisado)
# =====================================================================

N_CLUSTERS = 3  # número de grupos por defecto (viviseccionable)


def agrupar_estudiantes(estudiantes, k=None):
    """
    Agrupa estudiantes por patrones de aprendizaje con K-Means (NO supervisado:
    no usa etiquetas, solo encuentra estructura -> honesto, sin circularidad).

    estudiantes: lista de dicts con keys:
        student_id, name, nivel, promedio, num_quizzes, tiempo_promedio, nivel_idx
    Devuelve: lista de grupos [{grupo, etiqueta, promedio, num_estudiantes, miembros:[...]}].
    """
    k = k or N_CLUSTERS
    n = len(estudiantes)
    if n == 0:
        return []
    k = max(1, min(k, n))  # no puede haber más grupos que estudiantes

    X = np.array([[
        e.get("promedio", 0.0),
        e.get("num_quizzes", 0),
        e.get("tiempo_promedio", 0.0),
        e.get("nivel_idx", 0),
    ] for e in estudiantes], dtype=float)

    # estandarizar porque las variables están en escalas distintas
    X_scaled = StandardScaler().fit_transform(X)
    modelo = KMeans(n_clusters=k, random_state=42, n_init=10)
    etiquetas = modelo.fit_predict(X_scaled)

    grupos = {}
    for e, lab in zip(estudiantes, etiquetas):
        grupos.setdefault(int(lab), []).append(e)

    resultado = []
    for miembros in grupos.values():
        prom = round(sum(m.get("promedio", 0) for m in miembros) / len(miembros), 1)
        if prom >= 70:
            etiqueta = "Buen desempeño"
        elif prom >= 45:
            etiqueta = "En progreso"
        else:
            etiqueta = "Necesitan apoyo"
        resultado.append({
            "etiqueta": etiqueta,
            "promedio": prom,
            "num_estudiantes": len(miembros),
            "miembros": [
                {
                    "student_id": m["student_id"],
                    "name": m["name"],
                    "nivel": m.get("nivel"),
                    "promedio": round(m.get("promedio", 0), 1),
                }
                for m in miembros
            ],
        })

    resultado.sort(key=lambda g: g["promedio"], reverse=True)
    for i, g in enumerate(resultado, start=1):
        g["grupo"] = i
    return resultado


# =====================================================================
#  Métrica de COHERENCIA (reemplaza el accuracy sintético inventado)
# =====================================================================

def metrica_coherencia(estudiantes, contents, top_n=5):
    """
    Métrica honesta y verificable que reemplaza el accuracy sintético.

    Coherencia (%) = recomendaciones coherentes / total recomendaciones * 100,
    donde una recomendación es 'coherente' si cumple AL MENOS 2 de 3 criterios:
    nivel, perfil cognitivo y preferencia (0.4 + 0.4 + 0.2  ->  >= 0.6).

    Se mide sobre el top-N por la regla, SIN el filtro de coherencia del
    recomendador, para que el número sea una medición real (no trivialmente 100%).

    estudiantes: lista de dicts con current_level, cognitive_profile, learning_preference.
    contents: lista de dicts con level, recommended_profile, content_type.
    """
    total = 0
    coherentes = 0
    for e in estudiantes:
        nivel = e.get("current_level") or "basico"
        profile = e.get("cognitive_profile") or "general"
        pref = e.get("learning_preference") or "visual"
        puntajes = []
        for c in contents:
            s = 0.0
            if c.get("level") == nivel:
                s += 0.4
            if c.get("recommended_profile") == profile:
                s += 0.4
            if c.get("content_type") == pref:
                s += 0.2
            puntajes.append(round(s, 2))
        puntajes.sort(reverse=True)
        top = puntajes[:top_n]
        total += len(top)
        coherentes += sum(1 for s in top if s >= 0.6)

    coherencia = round((coherentes / total) * 100, 1) if total else 0.0
    return {
        "coherencia": coherencia,
        "recomendaciones_coherentes": coherentes,
        "total_recomendaciones": total,
        "criterio": ">= 2 de 3 (nivel, perfil, preferencia)",
        "estudiantes_evaluados": len(estudiantes),
        "top_n": top_n,
    }


MIN_INTERACCIONES = 5  # interacciones reales mínimas para reportar concordancia


def _es_coherente(nivel, profile, pref, contenido):
    """¿El contenido cumple >= 2 de 3 criterios para ese estudiante?"""
    s = 0.0
    if contenido.get("level") == nivel:
        s += 0.4
    if contenido.get("recommended_profile") == profile:
        s += 0.4
    if contenido.get("content_type") == pref:
        s += 0.2
    return s >= 0.6


def concordancia_desempeno(interacciones):
    """
    Métrica HONESTA atada al desempeño REAL (puede salir baja, y eso está bien).
    interacciones: lista de dicts {"aprobado": bool}.
    Concordancia = % de quizzes APROBADOS (score >= 70) sobre el TOTAL de quizzes resueltos.
    Si hay menos de MIN_INTERACCIONES -> 'datos insuficientes'.
    """
    total = len(interacciones)
    aprobados = sum(1 for i in interacciones if i.get("aprobado"))
    confianza = "alta" if total >= 30 else ("media" if total >= 15 else "baja")
    if total < MIN_INTERACCIONES:
        return {"concordancia": None, "aprobados": aprobados, "interacciones": total,
                "confianza": "baja", "motivo": "datos insuficientes"}
    return {"concordancia": round(aprobados / total * 100, 1), "aprobados": aprobados,
            "interacciones": total, "confianza": confianza, "motivo": "ok"}


if not os.path.exists(MODEL_PATH):
    try:
        train_model()
    except Exception:
        pass