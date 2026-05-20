from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.database import engine, Base
from app.api.v1 import router as api_router
from app.db.seed import seed_initial_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_initial_data()
    yield


app = FastAPI(
    title="PEAML API",
    description="Plataforma Educativa Adaptativa basada en Machine Learning",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "PEAML Backend",
        "version": "1.0.0",
    }
