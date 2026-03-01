"""
Simulation execution API routes.
"""
import time

from fastapi import APIRouter, HTTPException, status

from app.schemas import SimulationRequest, SimulationResponse, SeriesCircuitRequest, SeriesCircuitResponse
from app.simulation.engine.solver import DCNodalSolver
from app.simulation.engine.series import series_circuit_analysis

router = APIRouter(prefix="/simulation", tags=["simulation"])


@router.post("/run", response_model=SimulationResponse)
def run_simulation(payload: SimulationRequest):
    """
    Accept a circuit description and return DC nodal analysis results.
    """
    try:
        start = time.perf_counter()
        solver = DCNodalSolver(payload.elements, payload.connections)
        results = solver.solve()
        duration_ms = (time.perf_counter() - start) * 1000
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    return SimulationResponse(results=results, solver="dc_nodal", duration_ms=round(duration_ms, 3))


@router.post("/series", response_model=SeriesCircuitResponse)
def run_series_simulation(payload: SeriesCircuitRequest):
    """
    Compute total current and voltage drop across each resistor in a series circuit.

    Given a list of resistances and a voltage source, returns:
    * ``total_resistance`` – sum of all resistances (Ω)
    * ``total_current``    – current through the circuit (A)
    * ``voltage_drops``    – voltage drop across each individual resistor (V)
    """
    try:
        result = series_circuit_analysis(payload.resistances, payload.voltage)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    return result
