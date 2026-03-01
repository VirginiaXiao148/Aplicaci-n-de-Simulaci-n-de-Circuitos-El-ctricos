"""
Pydantic schema for a circuit Component.
"""
from enum import Enum

from pydantic import BaseModel, Field


class ComponentTipo(str, Enum):
    resistencia = "resistencia"
    capacitor = "capacitor"
    inductor = "inductor"
    fuente_voltaje = "fuente_voltaje"
    fuente_corriente = "fuente_corriente"
    tierra = "tierra"


class Component(BaseModel):
    id: str = Field(..., description="Identificador único del componente")
    tipo: ComponentTipo = Field(..., description="Tipo de componente del circuito")
    valor: float = Field(..., ge=0, description="Valor numérico del componente (debe ser ≥ 0)")
    unidad: str = Field(..., description="Unidad del valor (e.g. Ω, F, H, V, A)")
    nodos: list[str] = Field(default_factory=list, description="Nodos a los que está conectado el componente")
