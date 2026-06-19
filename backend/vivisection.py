"""
Vivisección paso a paso del modelo de PEAML.

Ejecuta CADA parte del ML real sobre datos de EJEMPLO, con pausas, para verlo
funcionar variable por variable en la terminal. No necesita la base de datos ni
modifica la aplicación.

Uso (en la carpeta backend, con el venv activado):
    python vivisection.py

En cada paso, presiona Enter para ejecutar y ver los print() del modelo real.
Para experimentar, cambia los parámetros arriba de app/ml/model.py (umbrales,
pesos, N_CLUSTERS, etc.) y vuelve a correr este script.
"""
from app.ml import model

# Encendemos el modo verbose del modelo REAL (imprime sus variables internas).
# Solo afecta a esta corrida del script, no al archivo ni a la app.
model.VERBOSE = True


def pausa(titulo):
    print("\n" + "=" * 60)
    print("PASO:", titulo)
    print("=" * 60)
    input("Presiona Enter para ejecutar este paso...")


def main():
    print("VIVISECCIÓN DEL MODELO PEAML  (datos de ejemplo)")
    print("Parámetros actuales (se editan en app/ml/model.py):")
    print(f"  UMBRAL_APROBAR={model.UMBRAL_APROBAR} | UMBRAL_REPROBAR={model.UMBRAL_REPROBAR}")
    print(f"  MIN_APROBADAS_PARA_SUBIR={model.MIN_APROBADAS_PARA_SUBIR} | FALLAS_PARA_BAJAR={model.FALLAS_PARA_BAJAR}")
    print(f"  N_CLUSTERS={model.N_CLUSTERS} | UMBRAL_DISCRIMINACION={model.UMBRAL_DISCRIMINACION} | MIN_INTERACCIONES={model.MIN_INTERACCIONES}")

    # ---- 1. Nivel por desempeño ----
    pausa("1) Nivel por desempeño (progresión por reto)")
    historial = [
        {"score": 90.0, "content_level": "basico"},
        {"score": 80.0, "content_level": "basico"},
        {"score": 75.0, "content_level": "intermedio"},
        {"score": 40.0, "content_level": "intermedio"},
    ]
    nivel = model.nivel_por_desempeno(historial, nivel_actual="basico")
    print(">> Nivel calculado:", nivel)

    # ---- 2. Recomendador ----
    pausa("2) Recomendador hibrido (regla + datos reales + reto)")
    estudiante = {"current_level": "basico", "cognitive_profile": "TEA", "preferencia_contenido": "visual"}
    contenidos = [
        {"id": 1, "title": "Figuras (TEA/visual/basico)", "level": "basico", "recommended_profile": "TEA", "content_type": "visual"},
        {"id": 2, "title": "Cuento (dislexia/auditivo/basico)", "level": "basico", "recommended_profile": "dislexia", "content_type": "auditivo"},
        {"id": 3, "title": "Emociones (TEA/visual/intermedio)", "level": "intermedio", "recommended_profile": "TEA", "content_type": "visual"},
    ]
    rendimiento = {1: 85.0, 3: 60.0}  # promedio real de estudiantes parecidos por contenido
    recs = model.get_content_recommendations(estudiante, contenidos, rendimiento)
    print(">> Recomendaciones:", [r["title"] for r in recs])

    # ---- 3. Calidad de items ----
    pausa("3) Calidad de items (dificultad y discriminacion)")
    respuestas = [
        {"score": 90, "is_correct": True},
        {"score": 80, "is_correct": True},
        {"score": 70, "is_correct": True},
        {"score": 40, "is_correct": False},
        {"score": 30, "is_correct": False},
        {"score": 20, "is_correct": False},
    ]
    print(">> Calidad del item:", model.calidad_item(respuestas))

    # ---- 4. Clustering ----
    pausa("4) Clustering de estudiantes (K-Means)")
    estudiantes = [
        {"student_id": 1, "name": "Ana",  "nivel": "avanzado",   "promedio": 90, "num_quizzes": 6, "tiempo_promedio": 20, "nivel_idx": 2},
        {"student_id": 2, "name": "Beto", "nivel": "basico",     "promedio": 30, "num_quizzes": 5, "tiempo_promedio": 50, "nivel_idx": 0},
        {"student_id": 3, "name": "Caro", "nivel": "intermedio", "promedio": 60, "num_quizzes": 4, "tiempo_promedio": 35, "nivel_idx": 1},
        {"student_id": 4, "name": "Dani", "nivel": "avanzado",   "promedio": 85, "num_quizzes": 7, "tiempo_promedio": 22, "nivel_idx": 2},
        {"student_id": 5, "name": "Edu",  "nivel": "basico",     "promedio": 35, "num_quizzes": 5, "tiempo_promedio": 48, "nivel_idx": 0},
    ]
    grupos = model.agrupar_estudiantes(estudiantes, k=2)
    print(">> Grupos:", [(g["grupo"], g["etiqueta"], [m["name"] for m in g["miembros"]]) for g in grupos])

    # ---- 5. Consistencia (coherencia) ----
    pausa("5) Metrica de consistencia (coherencia)")
    estudiantes_coh = [
        {"current_level": "basico", "cognitive_profile": "TEA", "learning_preference": "visual"},
        {"current_level": "intermedio", "cognitive_profile": "TDAH", "learning_preference": "interactivo"},
    ]
    consist = model.metrica_coherencia(estudiantes_coh, contenidos)
    print(">> Consistencia:", consist["coherencia"], "%")

    # ---- 6. Concordancia con desempeno real ----
    pausa("6) Concordancia con desempeno real (% aprobados)")
    interacciones = [
        {"aprobado": True}, {"aprobado": False}, {"aprobado": True},
        {"aprobado": True}, {"aprobado": False}, {"aprobado": True},
    ]
    print(">> Concordancia:", model.concordancia_desempeno(interacciones))

    print("\nFin de la viviseccion.")


if __name__ == "__main__":
    main()
