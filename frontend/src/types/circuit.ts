export type ComponentType =
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  | 'voltage_source'
  | 'current_source'
  | 'ground'
  | 'wire';

export interface Position {
  x: number;
  y: number;
}

export interface Terminal {
  id: string;
  componentId: string;
  position: Position; // relative to component center
  connectedWireIds: string[];
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  label: string;
  value: number;
  unit: string;
  position: Position;
  rotation: number; // 0, 90, 180, 270
  terminals: Terminal[];
}

export interface Wire {
  id: string;
  startTerminalId: string;
  endTerminalId: string;
  points: Position[];
}

export interface Circuit {
  components: CircuitComponent[];
  wires: Wire[];
}

export interface SimulationResult {
  nodeVoltages: { [nodeId: string]: number };
  branchCurrents: { [componentId: string]: number };
  powerDissipation: { [componentId: string]: number };
  success: boolean;
  error?: string;
}
