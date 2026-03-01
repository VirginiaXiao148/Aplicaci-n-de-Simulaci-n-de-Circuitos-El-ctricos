"""
Application settings loaded from environment variables / .env file.
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Circuit Simulator API"
    DATABASE_URL: str = "sqlite:///./circuit_simulator.db"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    SECRET_KEY: str = "changeme"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
