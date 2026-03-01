import type { Circuit, SimulationResult } from '../types/circuit';

// Build node connectivity map: terminalId -> node number (0 = ground)
function buildNodeMap(circuit: Circuit): Map<string, number> {
  const parent = new Map<string, string>();
  const groundRoots = new Set<string>();

  // Initialize union-find
  circuit.components.forEach((comp) => {
    comp.terminals.forEach((t) => {
      parent.set(t.id, t.id);
    });
  });

  function find(id: string): string {
    if (parent.get(id) !== id) {
      parent.set(id, find(parent.get(id)!));
    }
    return parent.get(id)!;
  }

  function union(a: string, b: string) {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) return;
    // Ground roots take precedence
    if (groundRoots.has(rb)) {
      parent.set(ra, rb);
    } else {
      parent.set(rb, ra);
    }
  }

  // Mark ground terminals
  circuit.components.forEach((comp) => {
    if (comp.type === 'ground') {
      comp.terminals.forEach((t) => {
        groundRoots.add(t.id);
      });
    }
  });

  // Connect terminals via wires
  circuit.wires.forEach((wire) => {
    union(wire.startTerminalId, wire.endTerminalId);
  });

  // After all unions, re-check ground roots
  const groundNodes = new Set<string>();
  groundRoots.forEach((gid) => {
    groundNodes.add(find(gid));
  });

  // Assign node numbers
  const rootToNode = new Map<string, number>();
  let nodeCount = 1;

  const allTerminalIds: string[] = [];
  circuit.components.forEach((comp) => {
    comp.terminals.forEach((t) => allTerminalIds.push(t.id));
  });

  allTerminalIds.forEach((tid) => {
    const root = find(tid);
    if (!rootToNode.has(root)) {
      if (groundNodes.has(root)) {
        rootToNode.set(root, 0);
      } else {
        rootToNode.set(root, nodeCount++);
      }
    }
  });

  const nodeMap = new Map<string, number>();
  allTerminalIds.forEach((tid) => {
    const root = find(tid);
    nodeMap.set(tid, rootToNode.get(root) ?? nodeCount++);
  });

  return nodeMap;
}

function solveLinearSystem(A: number[][], b: number[]): number[] | null {
  const n = A.length;
  if (n === 0) return [];
  const aug = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) {
        maxRow = row;
      }
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    if (Math.abs(aug[col][col]) < 1e-12) return null;

    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col] / aug[col][col];
      for (let j = col; j <= n; j++) {
        aug[row][j] -= factor * aug[col][j];
      }
    }
  }

  return aug.map((row, i) => row[n] / row[i]);
}

export function simulateDC(circuit: Circuit): SimulationResult {
  try {
    if (circuit.components.length === 0) {
      return {
        nodeVoltages: {},
        branchCurrents: {},
        powerDissipation: {},
        success: true,
      };
    }

    // Check if there is at least one ground
    const hasGround = circuit.components.some((c) => c.type === 'ground');
    if (!hasGround) {
      return {
        nodeVoltages: {},
        branchCurrents: {},
        powerDissipation: {},
        success: false,
        error: 'No ground node found. Add a GND component.',
      };
    }

    const nodeMap = buildNodeMap(circuit);

    let maxNode = 0;
    nodeMap.forEach((v) => {
      if (v > maxNode) maxNode = v;
    });

    if (maxNode === 0) {
      return {
        nodeVoltages: { '0': 0 },
        branchCurrents: {},
        powerDissipation: {},
        success: true,
      };
    }

    const n = maxNode; // number of non-ground nodes

    const voltageSources = circuit.components.filter(
      (c) => c.type === 'voltage_source'
    );
    const m = voltageSources.length;
    const size = n + m;

    const A: number[][] = Array.from({ length: size }, () =>
      new Array(size).fill(0)
    );
    const b: number[] = new Array(size).fill(0);

    const getNode = (comp: typeof circuit.components[0], termIdx: number): number => {
      if (termIdx >= comp.terminals.length) return 0;
      return nodeMap.get(comp.terminals[termIdx].id) ?? 0;
    };

    circuit.components.forEach((comp) => {
      if (comp.type === 'ground') return;
      if (comp.terminals.length < 2) return;

      if (comp.type === 'resistor') {
        const ni = getNode(comp, 0) - 1;
        const nj = getNode(comp, 1) - 1;
        const G = comp.value > 0 ? 1 / comp.value : 1e-9;
        if (ni >= 0) A[ni][ni] += G;
        if (nj >= 0) A[nj][nj] += G;
        if (ni >= 0 && nj >= 0) {
          A[ni][nj] -= G;
          A[nj][ni] -= G;
        }
      } else if (comp.type === 'current_source') {
        const ni = getNode(comp, 0) - 1;
        const nj = getNode(comp, 1) - 1;
        if (nj >= 0) b[nj] += comp.value;
        if (ni >= 0) b[ni] -= comp.value;
      } else if (comp.type === 'voltage_source') {
        const vsIdx = voltageSources.findIndex((vs) => vs.id === comp.id);
        if (vsIdx < 0) return;
        const jIdx = n + vsIdx;
        const ni = getNode(comp, 0) - 1; // + terminal
        const nj = getNode(comp, 1) - 1; // - terminal
        if (ni >= 0) {
          A[ni][jIdx] += 1;
          A[jIdx][ni] += 1;
        }
        if (nj >= 0) {
          A[nj][jIdx] -= 1;
          A[jIdx][nj] -= 1;
        }
        b[jIdx] = comp.value;
      } else if (comp.type === 'capacitor') {
        // DC: open circuit - no stamp
      } else if (comp.type === 'inductor') {
        // DC: short circuit - treat as 0V voltage source
        // simplified: add small resistor
        const ni = getNode(comp, 0) - 1;
        const nj = getNode(comp, 1) - 1;
        const G = 1 / 1e-6;
        if (ni >= 0) A[ni][ni] += G;
        if (nj >= 0) A[nj][nj] += G;
        if (ni >= 0 && nj >= 0) {
          A[ni][nj] -= G;
          A[nj][ni] -= G;
        }
      }
    });

    if (size === 0) {
      return {
        nodeVoltages: { '0': 0 },
        branchCurrents: {},
        powerDissipation: {},
        success: true,
      };
    }

    const solution = solveLinearSystem(A, b);
    if (!solution) {
      return {
        nodeVoltages: {},
        branchCurrents: {},
        powerDissipation: {},
        success: false,
        error: 'Singular matrix – check circuit connections (e.g. floating nodes).',
      };
    }

    const nodeVoltages: { [nodeId: string]: number } = { '0': 0 };
    for (let i = 0; i < n; i++) {
      nodeVoltages[String(i + 1)] = solution[i];
    }

    const branchCurrents: { [componentId: string]: number } = {};
    const powerDissipation: { [componentId: string]: number } = {};

    const getVoltage = (node: number): number =>
      node === 0 ? 0 : (solution[node - 1] ?? 0);

    circuit.components.forEach((comp) => {
      if (comp.terminals.length < 2) return;
      const n1 = getNode(comp, 0);
      const n2 = getNode(comp, 1);
      const v1 = getVoltage(n1);
      const v2 = getVoltage(n2);
      const vDiff = v1 - v2;

      if (comp.type === 'resistor') {
        const current = comp.value > 0 ? vDiff / comp.value : 0;
        branchCurrents[comp.id] = current;
        powerDissipation[comp.id] = current * current * comp.value;
      } else if (comp.type === 'voltage_source') {
        const vsIdx = voltageSources.findIndex((vs) => vs.id === comp.id);
        if (vsIdx >= 0) {
          const current = solution[n + vsIdx] ?? 0;
          branchCurrents[comp.id] = current;
          powerDissipation[comp.id] = -comp.value * current;
        }
      } else if (comp.type === 'current_source') {
        branchCurrents[comp.id] = comp.value;
        powerDissipation[comp.id] = -vDiff * comp.value;
      } else if (comp.type === 'inductor') {
        const current = comp.value > 0 ? vDiff / comp.value : 0;
        branchCurrents[comp.id] = current;
        powerDissipation[comp.id] = 0;
      }
    });

    return {
      nodeVoltages,
      branchCurrents,
      powerDissipation,
      success: true,
    };
  } catch (e) {
    return {
      nodeVoltages: {},
      branchCurrents: {},
      powerDissipation: {},
      success: false,
      error: String(e),
    };
  }
}
