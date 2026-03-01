"""
Circuit component data classes.

Each component encapsulates its type, properties, and MNA stamp logic so
the solver can remain generic.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class CircuitElement:
    id: str
    type: str
    position: dict[str, float] = field(default_factory=lambda: {"x": 0, "y": 0})
    properties: dict[str, Any] = field(default_factory=dict)


@dataclass
class Resistor(CircuitElement):
    type: str = "resistor"

    @property
    def resistance(self) -> float:
        return float(self.properties.get("resistance", 1000))


@dataclass
class Capacitor(CircuitElement):
    type: str = "capacitor"

    @property
    def capacitance(self) -> float:
        return float(self.properties.get("capacitance", 1e-6))


@dataclass
class Inductor(CircuitElement):
    type: str = "inductor"

    @property
    def inductance(self) -> float:
        return float(self.properties.get("inductance", 1e-3))


@dataclass
class VoltageSource(CircuitElement):
    type: str = "voltage_source"

    @property
    def voltage(self) -> float:
        return float(self.properties.get("voltage", 5))


@dataclass
class CurrentSource(CircuitElement):
    type: str = "current_source"

    @property
    def current(self) -> float:
        return float(self.properties.get("current", 1e-3))


@dataclass
class Ground(CircuitElement):
    type: str = "ground"


ELEMENT_REGISTRY: dict[str, type[CircuitElement]] = {
    "resistor": Resistor,
    "capacitor": Capacitor,
    "inductor": Inductor,
    "voltage_source": VoltageSource,
    "current_source": CurrentSource,
    "ground": Ground,
}


def element_from_dict(data: dict[str, Any]) -> CircuitElement:
    """Factory – convert a raw dict to the appropriate CircuitElement subclass."""
    el_type = data.get("type", "")
    cls = ELEMENT_REGISTRY.get(el_type, CircuitElement)
    return cls(
        id=data.get("id", ""),
        type=el_type,
        position=data.get("position", {"x": 0, "y": 0}),
        properties=data.get("properties", {}),
    )
