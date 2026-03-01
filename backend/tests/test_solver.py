"""
Unit tests for the DC Nodal Solver.
"""
import pytest

from app.simulation.engine.solver import DCNodalSolver


def _make_simple_resistive_circuit():
    """
    Simple DC circuit: 5 V source in series with a 1 kΩ resistor.

    Topology (nodes: GND=0 V reference, n1=5 V):
        V1(+) ──── n1 ──── R1 ──── GND
         └─────────────────────────┘
    Elements use the ``nodes`` list: [negative_terminal, positive_terminal].
    """
    elements = [
        {"id": "gnd_el", "type": "ground",         "properties": {},               "nodes": ["GND"]},
        {"id": "V1",     "type": "voltage_source",  "properties": {"voltage": 5},  "nodes": ["GND", "n1"]},
        {"id": "R1",     "type": "resistor",        "properties": {"resistance": 1000}, "nodes": ["n1", "GND"]},
    ]
    return elements, []


def test_solver_returns_results():
    elements, connections = _make_simple_resistive_circuit()
    solver = DCNodalSolver(elements, connections)
    results = solver.solve()
    assert isinstance(results, list)
    assert len(results) > 0


def test_solver_result_items_have_required_fields():
    elements, connections = _make_simple_resistive_circuit()
    solver = DCNodalSolver(elements, connections)
    results = solver.solve()
    for item in results:
        assert hasattr(item, "label")
        assert hasattr(item, "value")
        assert hasattr(item, "unit")


def test_solver_node_voltage_correct():
    """Node n1 should be ~5 V (within 1 % of ideal)."""
    elements, connections = _make_simple_resistive_circuit()
    solver = DCNodalSolver(elements, connections)
    results = solver.solve()
    voltage_results = {r.label: r.value for r in results}
    assert "V(n1)" in voltage_results
    assert abs(voltage_results["V(n1)"] - 5.0) < 0.05  # within 1 % of 5 V


def test_solver_branch_current_correct():
    """Branch current through R1 should be ~5 mA."""
    elements, connections = _make_simple_resistive_circuit()
    solver = DCNodalSolver(elements, connections)
    results = solver.solve()
    current_results = {r.label: r.value for r in results}
    assert "I(R1)" in current_results
    assert abs(current_results["I(R1)"] - 0.005) < 1e-4  # within 0.1 mA


def test_solver_raises_on_empty_connections():
    elements = [{"id": "r1", "type": "resistor", "properties": {"resistance": 1000}, "nodes": []}]
    solver = DCNodalSolver(elements, [])
    with pytest.raises(ValueError, match="conexiones"):
        solver.solve()


def test_solver_raises_on_zero_resistance():
    elements = [
        {"id": "gnd_el", "type": "ground",   "properties": {}, "nodes": ["GND"]},
        {"id": "R1",     "type": "resistor", "properties": {"resistance": 0}, "nodes": ["n1", "GND"]},
        {"id": "V1",     "type": "voltage_source", "properties": {"voltage": 5}, "nodes": ["GND", "n1"]},
    ]
    solver = DCNodalSolver(elements, [])
    with pytest.raises(ValueError):
        solver.solve()
