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


# ---------------------------------------------------------------------------
# Series-circuit schemas
# ---------------------------------------------------------------------------

class SeriesCircuitRequest(BaseModel):
    resistances: list[float] = Field(..., description="List of resistance values in ohms (series order)")
    voltage: float = Field(..., description="Source voltage in volts")


class SeriesResistorResult(BaseModel):
    index: int = Field(..., description="Zero-based position in the series chain")
    resistance: float = Field(..., description="Resistance value in ohms")
    voltage_drop: float = Field(..., description="Voltage drop across this resistor in volts")


class SeriesCircuitResponse(BaseModel):
    total_resistance: float = Field(..., description="Total series resistance in ohms")
    total_current: float = Field(..., description="Total current in amperes")
    voltage_drops: list[SeriesResistorResult] = Field(..., description="Voltage drop across each resistor")
