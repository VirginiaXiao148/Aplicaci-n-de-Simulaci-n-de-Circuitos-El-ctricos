"""
Pydantic schemas for Circuit request/response validation.
"""
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class CircuitBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: str | None = Field(None, max_length=1024)
    elements: list[dict[str, Any]] = Field(default_factory=list)
    connections: list[dict[str, Any]] = Field(default_factory=list)


class CircuitCreate(CircuitBase):
    pass


class CircuitUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    description: str | None = None
    elements: list[dict[str, Any]] | None = None
    connections: list[dict[str, Any]] | None = None


class CircuitRead(CircuitBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
