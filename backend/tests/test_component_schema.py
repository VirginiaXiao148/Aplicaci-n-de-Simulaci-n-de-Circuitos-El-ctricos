"""
Unit tests for the Component schema.
"""
import pytest
from pydantic import ValidationError

from app.schemas.component import Component, ComponentTipo


def test_component_valid():
    comp = Component(
        id="R1",
        tipo=ComponentTipo.resistencia,
        valor=1000.0,
        unidad="Ω",
        nodos=["n1", "GND"],
    )
    assert comp.id == "R1"
    assert comp.tipo == ComponentTipo.resistencia
    assert comp.valor == 1000.0
    assert comp.unidad == "Ω"
    assert comp.nodos == ["n1", "GND"]


def test_component_capacitor():
    comp = Component(
        id="C1",
        tipo=ComponentTipo.capacitor,
        valor=100e-6,
        unidad="F",
        nodos=["n2", "GND"],
    )
    assert comp.tipo == ComponentTipo.capacitor
    assert comp.valor == pytest.approx(100e-6)


def test_component_empty_nodos():
    comp = Component(id="R2", tipo=ComponentTipo.resistencia, valor=470.0, unidad="Ω")
    assert comp.nodos == []


def test_component_invalid_tipo():
    with pytest.raises(ValidationError):
        Component(id="X1", tipo="transistor", valor=1.0, unidad="V", nodos=[])


def test_component_missing_required_fields():
    with pytest.raises(ValidationError):
        Component(tipo=ComponentTipo.inductor, valor=1e-3, unidad="H", nodos=[])


def test_component_invalid_valor():
    with pytest.raises(ValidationError):
        Component(id="R3", tipo=ComponentTipo.resistencia, valor="no_es_numero", unidad="Ω", nodos=[])


def test_component_negative_valor():
    with pytest.raises(ValidationError):
        Component(id="R4", tipo=ComponentTipo.resistencia, valor=-10.0, unidad="Ω", nodos=[])


def test_component_all_tipos():
    for tipo in ComponentTipo:
        comp = Component(id=f"el_{tipo.value}", tipo=tipo, valor=1.0, unidad="?", nodos=[])
        assert comp.tipo == tipo
