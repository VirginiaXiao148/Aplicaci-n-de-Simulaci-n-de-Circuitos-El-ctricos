"""
Pydantic schemas for Simulation request/response validation.
"""
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    elements: list[dict[str, Any]] = Field(..., description="Circuit elements")
    connections: list[dict[str, Any]] = Field(default_factory=list, description="Wire connections")


class SimulationResultItem(BaseModel):
    label: str
    value: float
    unit: str


class SimulationResponse(BaseModel):
    results: list[SimulationResultItem]
    solver: str = "dc_nodal"
    duration_ms: float | None = None


class SimulationResultRead(SimulationResponse):
    id: int
    circuit_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
