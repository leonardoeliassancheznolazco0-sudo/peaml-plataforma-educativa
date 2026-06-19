import requests
import time
import statistics

BASE_URL = "http://localhost:8000"

def get_token():
    response = requests.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": "docente@peaml.edu",
        "password": "docente123"
    })
    return response.json()["access_token"]

def medir_latencia(url, metodo="GET", json=None, headers=None, repeticiones=10):
    tiempos = []
    for _ in range(repeticiones):
        inicio = time.time()
        if metodo == "GET":
            requests.get(url, headers=headers)
        elif metodo == "POST":
            requests.post(url, json=json, headers=headers)
        fin = time.time()
        tiempos.append((fin - inicio) * 1000)
    return {
        "promedio_ms": round(statistics.mean(tiempos), 2),
        "minimo_ms":   round(min(tiempos), 2),
        "maximo_ms":   round(max(tiempos), 2),
        "mediana_ms":  round(statistics.median(tiempos), 2),
    }

def test_latencia_health():
    result = medir_latencia(f"{BASE_URL}/health")
    print(f"\n  /health — promedio: {result['promedio_ms']}ms | max: {result['maximo_ms']}ms")
    assert result["promedio_ms"] < 3000

def test_latencia_login():
    result = medir_latencia(f"{BASE_URL}/api/v1/auth/login", metodo="POST", json={
        "email": "docente@peaml.edu",
        "password": "docente123"
    })
    print(f"\n  /auth/login — promedio: {result['promedio_ms']}ms | max: {result['maximo_ms']}ms")
    assert result["promedio_ms"] < 3000

def test_latencia_estudiantes():
    token = get_token()
    result = medir_latencia(
        f"{BASE_URL}/api/v1/students/",
        headers={"Authorization": f"Bearer {token}"}
    )
    print(f"\n  /students/ — promedio: {result['promedio_ms']}ms | max: {result['maximo_ms']}ms")
    assert result["promedio_ms"] < 3000

def test_latencia_contenidos():
    result = medir_latencia(f"{BASE_URL}/api/v1/contents/")
    print(f"\n  /contents/ — promedio: {result['promedio_ms']}ms | max: {result['maximo_ms']}ms")
    assert result["promedio_ms"] < 3000

def test_latencia_ml_predict():
    token = get_token()
    result = medir_latencia(
        f"{BASE_URL}/api/v1/ml/predict",
        metodo="POST",
        json={
            "student_id": 1,
            "age": 9,
            "cognitive_profile": "TEA",
            "porcentaje_aciertos": 0.6,
            "tiempo_respuesta_promedio": 15.0,
            "intentos": 3,
            "preferencia_contenido": "visual"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    print(f"\n  /ml/predict — promedio: {result['promedio_ms']}ms | max: {result['maximo_ms']}ms")
    assert result["promedio_ms"] < 3000

def test_latencia_dashboard_admin():
    token_admin = requests.post(f"{BASE_URL}/api/v1/auth/login", json={
        "email": "admin@peaml.edu",
        "password": "admin123"
    }).json()["access_token"]
    result = medir_latencia(
        f"{BASE_URL}/api/v1/dashboard/admin",
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    print(f"\n  /dashboard/admin — promedio: {result['promedio_ms']}ms | max: {result['maximo_ms']}ms")
    assert result["promedio_ms"] < 3000