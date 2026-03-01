"""
DC Nodal Analysis Solver using the Modified Nodal Analysis (MNA) method.

Each element in the circuit must include a ``nodes`` list with two node ID
strings identifying the element's terminals.  One element of type ``ground``
must be present; the node listed first in its ``nodes`` list (or its ``id``
when ``nodes`` is omitted) is treated as the reference (0 V) node.

Example element payload::

    {"id": "R1", "type": "resistor", "properties": {"resistance": 1000},
     "nodes": ["n1", "GND"]}

The ``connections`` parameter is accepted for forward-compatibility (e.g.
rendering wires on screen) but is not used by the solver.
"""
from __future__ import annotations

from typing import Any

import numpy as np

from app.schemas.simulation import SimulationResultItem

# Large value used for the penalty (stamp) method for voltage sources
_PENALTY = 1e9


class DCNodalSolver:
    """
    Simplified DC nodal solver.

    Supported element types:
    * resistor       – ``resistance`` property (Ω)
    * voltage_source – ``voltage`` property (V); nodes[0] = V−, nodes[1] = V+
    * current_source – ``current`` property (A); conventional current flows
                       from nodes[0] → nodes[1]
    * capacitor / inductor / ground – treated as open / short / reference in DC
    """

    def __init__(self, elements: list[dict[str, Any]], connections: list[dict[str, Any]]):
        self.elements = elements
        self.connections = connections  # kept for future use (e.g. rendering)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def solve(self) -> list[SimulationResultItem]:
        """Run the DC analysis and return a list of result items."""
        node_ids = self._collect_nodes()
        if not node_ids:
            raise ValueError("El circuito no contiene conexiones.")

        ground_node = self._find_ground_node()
        non_ground = sorted(n for n in node_ids if n != ground_node)
        n = len(non_ground)

        if n == 0:
            raise ValueError("El circuito sólo tiene nodo de tierra; añade más nodos.")

        node_index: dict[str, int] = {node: i for i, node in enumerate(non_ground)}

        G = np.zeros((n, n))
        I_vec = np.zeros(n)

        for el in self.elements:
            el_type = el.get("type")
            props = el.get("properties", {})
            el_nodes = el.get("nodes", [])

            if el_type == "ground":
                continue  # reference node – no stamp needed

            if len(el_nodes) < 2:
                continue  # element is not fully connected; skip silently

            node_a, node_b = el_nodes[0], el_nodes[1]

            if el_type == "resistor":
                r = float(props.get("resistance", 1000))
                if r == 0:
                    raise ValueError(f"Resistencia cero en elemento {el.get('id')}.")
                self._stamp_conductance(G, node_index, node_a, node_b, 1.0 / r)

            elif el_type == "current_source":
                # Current flows from node_a (−) to node_b (+) inside the source
                i_val = float(props.get("current", 0))
                a = node_index.get(node_a)
                b = node_index.get(node_b)
                if a is not None:
                    I_vec[a] -= i_val
                if b is not None:
                    I_vec[b] += i_val

            elif el_type == "voltage_source":
                # nodes[0] = V− terminal, nodes[1] = V+ terminal
                v_val = float(props.get("voltage", 0))
                a = node_index.get(node_a)  # V−
                b = node_index.get(node_b)  # V+
                if b is not None and a is None:
                    # V− is ground → force V+ = v_val
                    G[b, b] += _PENALTY
                    I_vec[b] += v_val * _PENALTY
                elif a is not None and b is None:
                    # V+ is ground → force V− = −v_val
                    G[a, a] += _PENALTY
                    I_vec[a] -= v_val * _PENALTY
                elif a is not None and b is not None:
                    # Neither terminal grounded → force V+ − V− = v_val
                    G[a, a] += _PENALTY
                    G[b, b] += _PENALTY
                    G[a, b] -= _PENALTY
                    G[b, a] -= _PENALTY
                    I_vec[b] += v_val * _PENALTY
                    I_vec[a] -= v_val * _PENALTY

        try:
            voltages = np.linalg.solve(G, I_vec)
        except np.linalg.LinAlgError:
            raise ValueError(
                "No se puede resolver el circuito (matriz singular). Verifica las conexiones."
            )

        results: list[SimulationResultItem] = []
        for node, idx in node_index.items():
            results.append(
                SimulationResultItem(label=f"V({node})", value=round(float(voltages[idx]), 6), unit="V")
            )

        # Branch currents through resistors
        for el in self.elements:
            if el.get("type") == "resistor":
                el_nodes = el.get("nodes", [])
                if len(el_nodes) < 2:
                    continue
                r = float(el.get("properties", {}).get("resistance", 1000))
                na, nb = el_nodes[0], el_nodes[1]
                va = float(voltages[node_index[na]]) if na in node_index else 0.0
                vb = float(voltages[node_index[nb]]) if nb in node_index else 0.0
                current = (va - vb) / r if r else 0.0
                results.append(
                    SimulationResultItem(
                        label=f"I({el.get('id', 'R')})",
                        value=round(current, 9),
                        unit="A",
                    )
                )

        return results

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _collect_nodes(self) -> set[str]:
        nodes: set[str] = set()
        for el in self.elements:
            for node in el.get("nodes", []):
                nodes.add(node)
        return nodes

    def _find_ground_node(self) -> str | None:
        for el in self.elements:
            if el.get("type") == "ground":
                el_nodes = el.get("nodes", [])
                return el_nodes[0] if el_nodes else el.get("id")
        return None

    @staticmethod
    def _stamp_conductance(
        G: np.ndarray,
        node_index: dict[str, int],
        node_a: str,
        node_b: str,
        g: float,
    ) -> None:
        a = node_index.get(node_a)
        b = node_index.get(node_b)
        if a is not None:
            G[a, a] += g
        if b is not None:
            G[b, b] += g
        if a is not None and b is not None:
            G[a, b] -= g
            G[b, a] -= g
