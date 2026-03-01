"""
Unit tests for the series_circuit_analysis function.
"""
import pytest

from app.simulation.engine.series import series_circuit_analysis


def test_single_resistor():
    """A single 10 Ω resistor with 10 V source → 1 A, 10 V drop."""
    result = series_circuit_analysis([10.0], 10.0)
    assert result.total_resistance == 10.0
    assert abs(result.total_current - 1.0) < 1e-9
    assert len(result.voltage_drops) == 1
    assert abs(result.voltage_drops[0].voltage_drop - 10.0) < 1e-6


def test_two_equal_resistors():
    """Two 100 Ω resistors in series with 10 V → 0.05 A, 5 V each."""
    result = series_circuit_analysis([100.0, 100.0], 10.0)
    assert result.total_resistance == 200.0
    assert abs(result.total_current - 0.05) < 1e-9
    assert abs(result.voltage_drops[0].voltage_drop - 5.0) < 1e-6
    assert abs(result.voltage_drops[1].voltage_drop - 5.0) < 1e-6


def test_voltage_drops_sum_to_source_voltage():
    """Sum of all voltage drops must equal the source voltage (KVL)."""
    resistances = [100.0, 220.0, 470.0]
    voltage = 12.0
    result = series_circuit_analysis(resistances, voltage)
    total_drop = sum(vd.voltage_drop for vd in result.voltage_drops)
    assert abs(total_drop - voltage) < 1e-6


def test_result_indexes_match_input_order():
    """voltage_drops list must preserve the input resistor order."""
    resistances = [50.0, 150.0, 300.0]
    result = series_circuit_analysis(resistances, 6.0)
    for i, vd in enumerate(result.voltage_drops):
        assert vd.index == i
        assert vd.resistance == resistances[i]


def test_raises_on_empty_list():
    with pytest.raises(ValueError, match="vacía"):
        series_circuit_analysis([], 5.0)


def test_raises_on_zero_resistance():
    with pytest.raises(ValueError, match="mayor que cero"):
        series_circuit_analysis([100.0, 0.0, 200.0], 12.0)


def test_raises_on_negative_resistance():
    with pytest.raises(ValueError, match="mayor que cero"):
        series_circuit_analysis([-50.0], 10.0)
