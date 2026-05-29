from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# ── Health Check ──────────────────────────────────────────────────────────────
def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

# ── Autenticación ─────────────────────────────────────────────────────────────
def test_login_valido():
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@peaml.edu",
        "password": "admin123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_contrasena_incorrecta():
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@peaml.edu",
        "password": "contrasena_incorrecta"
    })
    assert response.status_code == 401

def test_login_usuario_inexistente():
    response = client.post("/api/v1/auth/login", json={
        "email": "noexiste@peaml.edu",
        "password": "cualquiera"
    })
    assert response.status_code == 401

def test_login_campos_vacios():
    response = client.post("/api/v1/auth/login", json={
        "email": "",
        "password": ""
    })
    assert response.status_code == 422

# ── Registro ──────────────────────────────────────────────────────────────────
def test_registro_exitoso():
    response = client.post("/api/v1/auth/register", json={
        "name": "Usuario Test Pytest",
        "email": "pytest_nuevo_2026@peaml.edu",
        "password": "test123456",
        "role": "student"
    })
    assert response.status_code == 200
    assert "id" in response.json()

def test_registro_email_duplicado():
    client.post("/api/v1/auth/register", json={
        "name": "Duplicado",
        "email": "duplicado_pytest@peaml.edu",
        "password": "test123456",
        "role": "student"
    })
    response = client.post("/api/v1/auth/register", json={
        "name": "Duplicado",
        "email": "duplicado_pytest@peaml.edu",
        "password": "test123456",
        "role": "student"
    })
    assert response.status_code == 400

def test_registro_campos_faltantes():
    response = client.post("/api/v1/auth/register", json={
        "name": "Sin email"
    })
    assert response.status_code == 422

# ── Estudiantes ───────────────────────────────────────────────────────────────
def test_listar_estudiantes_sin_token():
    response = client.get("/api/v1/students/")
    assert response.status_code == 401

def test_listar_estudiantes_con_token():
    login = client.post("/api/v1/auth/login", json={
        "email": "docente@peaml.edu",
        "password": "docente123"
    })
    token = login.json()["access_token"]
    response = client.get("/api/v1/students/", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# ── Contenidos ────────────────────────────────────────────────────────────────
def test_listar_contenidos_sin_token():
    response = client.get("/api/v1/contents/")
    assert response.status_code == 200

def test_listar_contenidos_con_token():
    login = client.post("/api/v1/auth/login", json={
        "email": "docente@peaml.edu",
        "password": "docente123"
    })
    token = login.json()["access_token"]
    response = client.get("/api/v1/contents/", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200

# ── ML ────────────────────────────────────────────────────────────────────────
def test_ml_predict():
    login = client.post("/api/v1/auth/login", json={
        "email": "docente@peaml.edu",
        "password": "docente123"
    })
    token = login.json()["access_token"]
    response = client.post("/api/v1/ml/predict", json={
        "student_id": 1,
        "age": 9,
        "cognitive_profile": "TEA",
        "porcentaje_aciertos": 0.6,
        "tiempo_respuesta_promedio": 15.0,
        "intentos": 3,
        "preferencia_contenido": "visual"
    }, headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    assert "nivel_recomendado" in response.json()

def test_ml_predict_sin_token():
    response = client.post("/api/v1/ml/predict", json={
        "student_id": 1,
        "age": 9,
        "cognitive_profile": "TEA",
        "porcentaje_aciertos": 0.6,
        "tiempo_respuesta_promedio": 15.0,
        "intentos": 3,
        "preferencia_contenido": "visual"
    })
    assert response.status_code == 401