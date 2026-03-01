import React, { useState, useCallback, useEffect } from 'react';
import type { Circuit, CircuitComponent, Wire, Position, ComponentType, SimulationResult } from './types/circuit';
import ComponentLibrary from './components/ComponentLibrary';
import CircuitCanvas, { makeTerminals } from './components/CircuitCanvas';
import ParameterPanel from './components/ParameterPanel';
import ResultsPanel from './components/ResultsPanel';
import { simulateDC } from './simulation/mna';

const STORAGE_KEY = 'circuit-sim-v1';

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function getDefaultLabel(type: ComponentType, count: number): string {
  const map: Record<ComponentType, string> = {
    resistor: `R${count}`,
    capacitor: `C${count}`,
    inductor: `L${count}`,
    voltage_source: `V${count}`,
    current_source: `I${count}`,
    ground: `GND`,
    wire: `W${count}`,
  };
  return map[type];
}

const UNIT_MAP: Record<ComponentType, string> = {
  resistor: 'Ω',
  capacitor: 'F',
  inductor: 'H',
  voltage_source: 'V',
  current_source: 'A',
  ground: '',
  wire: '',
};

const DEFAULT_CIRCUIT: Circuit = { components: [], wires: [] };

function loadCircuit(): Circuit {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Circuit;
  } catch {
    // ignore
  }
  return DEFAULT_CIRCUIT;
}

function saveCircuit(circuit: Circuit) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(circuit));
}

const App: React.FC = () => {
  const [circuit, setCircuit] = useState<Circuit>(loadCircuit);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [compCounts, setCompCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    saveCircuit(circuit);
  }, [circuit]);

  const handleAddComponent = useCallback(
    (type: ComponentType, position: Position, defaultValue: number, unit: string) => {
      const id = makeId();
      const count = (compCounts[type] ?? 0) + 1;
      setCompCounts((prev) => ({ ...prev, [type]: count }));

      const newComp: CircuitComponent = {
        id,
        type,
        label: getDefaultLabel(type, count),
        value: defaultValue,
        unit: unit || UNIT_MAP[type],
        position,
        rotation: 0,
        terminals: makeTerminals(type, id),
      };

      setCircuit((prev) => ({
        ...prev,
        components: [...prev.components, newComp],
      }));
      setSelectedId(id);
    },
    [compCounts]
  );

  const handleMoveComponent = useCallback((id: string, position: Position) => {
    setCircuit((prev) => ({
      ...prev,
      components: prev.components.map((c) => (c.id === id ? { ...c, position } : c)),
    }));
  }, []);

  const handleUpdateComponent = useCallback(
    (id: string, changes: Partial<CircuitComponent>) => {
      setCircuit((prev) => ({
        ...prev,
        components: prev.components.map((c) => (c.id === id ? { ...c, ...changes } : c)),
      }));
    },
    []
  );

  const handleAddWire = useCallback((wire: Wire) => {
    setCircuit((prev) => ({
      ...prev,
      wires: [...prev.wires, wire],
    }));
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedId) return;
    setCircuit((prev) => {
      const comp = prev.components.find((c) => c.id === selectedId);
      const termIds = new Set(comp?.terminals.map((t) => t.id) ?? []);
      return {
        components: prev.components.filter((c) => c.id !== selectedId),
        wires: prev.wires.filter(
          (w) => !termIds.has(w.startTerminalId) && !termIds.has(w.endTerminalId)
        ),
      };
    });
    setSelectedId(null);
  }, [selectedId]);

  const handleSimulate = useCallback(() => {
    const result = simulateDC(circuit);
    setSimResult(result);
  }, [circuit]);

  const handleClear = useCallback(() => {
    if (window.confirm('Clear the entire circuit?')) {
      setCircuit(DEFAULT_CIRCUIT);
      setSelectedId(null);
      setSimResult(null);
    }
  }, []);

  const handleSave = useCallback(() => {
    saveCircuit(circuit);
    alert('Circuit saved!');
  }, [circuit]);

  const handleLoad = useCallback(() => {
    const loaded = loadCircuit();
    setCircuit(loaded);
    setSelectedId(null);
    setSimResult(null);
  }, []);

  const selectedComp = circuit.components.find((c) => c.id === selectedId) ?? null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#0f172a',
        color: '#e2e8f0',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          background: '#1e293b',
          borderBottom: '1px solid #334155',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          height: 52,
          gap: 16,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <circle cx={12} cy={12} r={10} stroke="#60a5fa" strokeWidth={2} />
            <path d="M8 12h8M12 8v8" stroke="#60a5fa" strokeWidth={2} strokeLinecap="round" />
          </svg>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#60a5fa', letterSpacing: 0.5 }}>
            Circuit Simulator
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: '💾 Save', action: handleSave },
            { label: '📂 Load', action: handleLoad },
            { label: '🗑 Clear', action: handleClear },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              style={{
                background: '#334155',
                color: '#cbd5e1',
                border: '1px solid #475569',
                borderRadius: 6,
                padding: '5px 12px',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
              }}
              onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.background = '#475569')}
              onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.background = '#334155')}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <div style={{ color: '#475569', fontSize: 11 }}>
          {circuit.components.length} components · {circuit.wires.length} wires
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ComponentLibrary onDragStart={() => {}} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div
            style={{
              background: '#1e293b',
              borderBottom: '1px solid #334155',
              padding: '4px 12px',
              fontSize: 11,
              color: '#475569',
              display: 'flex',
              gap: 16,
            }}
          >
            <span>🖱 Alt+drag / middle-click: Pan</span>
            <span>⚡ Scroll: Zoom</span>
            <span>🔗 Click terminal: Draw wire</span>
            <span>⌨ Del: Remove selected</span>
            <span>⎋ Esc: Cancel</span>
            {selectedComp && (
              <span style={{ color: '#60a5fa', marginLeft: 'auto' }}>
                Selected: <strong>{selectedComp.label}</strong>
              </span>
            )}
          </div>

          <CircuitCanvas
            circuit={circuit}
            selectedId={selectedId}
            onSelectComponent={setSelectedId}
            onAddComponent={handleAddComponent}
            onMoveComponent={handleMoveComponent}
            onAddWire={handleAddWire}
            onDeleteSelected={handleDeleteSelected}
          />
        </div>

        <aside
          style={{
            width: 220,
            minWidth: 220,
            background: '#1e293b',
            borderLeft: '1px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          <ParameterPanel component={selectedComp} onUpdate={handleUpdateComponent} />
          <div style={{ borderTop: '1px solid #334155', margin: '0 14px' }} />
          <ResultsPanel
            result={simResult}
            circuit={circuit}
            onSimulate={handleSimulate}
          />
        </aside>
      </div>
    </div>
  );
};

export default App;
