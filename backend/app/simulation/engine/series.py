"""
Series circuit analysis.

Given a list of resistances (in series) and a voltage source, computes:
* Total current flowing through the circuit.
* Voltage drop across each individual resistor.

Formula (Ohm's law for a series circuit):
    R_total = R1 + R2 + … + Rn
    I       = V / R_total
    V_k     = I * R_k   for each resistor k
"""
from __future__ import annotations

from app.schemas.simulation import SeriesCircuitResponse, SeriesResistorResult


def series_circuit_analysis(
    resistances: list[float],
    voltage: float,
) -> SeriesCircuitResponse:
    """Return total current and per-resistor voltage drops for a series circuit.

    Args:
        resistances: Ordered list of resistance values in ohms (all must be > 0).
        voltage:     Source voltage in volts.

    Returns:
        A :class:`SeriesCircuitResponse` with ``total_current`` and
        ``voltage_drops`` for each resistor.

    Raises:
        ValueError: If ``resistances`` is empty, any resistance is ≤ 0, or
                    ``voltage`` is not finite.
    """
    if not resistances:
        raise ValueError("La lista de resistencias no puede estar vacía.")

    for i, r in enumerate(resistances):
        if r <= 0:
            raise ValueError(
                f"La resistencia en la posición {i} debe ser mayor que cero (recibido: {r})."
            )

    r_total = sum(resistances)
    total_current = voltage / r_total

    voltage_drops = [
        SeriesResistorResult(
            index=i,
            resistance=r,
            voltage_drop=round(total_current * r, 9),
        )
        for i, r in enumerate(resistances)
    ]

    return SeriesCircuitResponse(
        total_resistance=round(r_total, 9),
        total_current=round(total_current, 9),
        voltage_drops=voltage_drops,
    )
