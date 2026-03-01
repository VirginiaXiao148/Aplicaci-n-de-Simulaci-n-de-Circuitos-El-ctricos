"""
Application entry point – creates the FastAPI app and registers all routers.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import circuits, simulation
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.1.0",
    description="API para el Simulador de Circuitos Eléctricos",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS – allow the React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"
app.include_router(circuits.router, prefix=API_PREFIX)
app.include_router(simulation.router, prefix=API_PREFIX)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
