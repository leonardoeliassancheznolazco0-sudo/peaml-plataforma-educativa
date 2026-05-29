import requests
import time

BASE_URL = "http://localhost:8000"

def test_sistema_disponible():
    response = requests.get(f"{BASE_URL}/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    print(f"\n  Sistema disponible: OK")

def test_multiples_requests_consecutivos():
    exitosos = 0
    total = 20
    for i in range(total):
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=5)
            if response.status_code == 200:
                exitosos += 1
        except:
            pass
    disponibilidad = (exitosos / total) * 100
    print(f"\n  Requests exitosos: {exitosos}/{total}")
    print(f"  Disponibilidad medida: {disponibilidad:.1f}%")
    assert disponibilidad >= 99

def test_endpoints_criticos_disponibles():
    endpoints = [
        "/health",
        "/api/v1/contents/",
        "/docs",
    ]
    for endpoint in endpoints:
        response = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
        assert response.status_code in [200, 422]
        print(f"\n  {endpoint} — {response.status_code} OK")

def test_tiempo_respuesta_aceptable():
    tiempos = []
    for _ in range(5):
        inicio = time.time()
        requests.get(f"{BASE_URL}/health")
        fin = time.time()
        tiempos.append((fin - inicio) * 1000)
    promedio = sum(tiempos) / len(tiempos)
    print(f"\n  Tiempo promedio: {promedio:.1f}ms")
    assert promedio < 3000