import React from 'react';

/**
 * SimulationControls – play / pause / reset buttons for the simulation.
 * Props:
 *   onRun    – callback to start simulation
 *   onReset  – callback to reset circuit
 *   running  – boolean indicating if simulation is active
 */
function SimulationControls({ onRun, onReset, running = false }) {
  return (
    <div className="simulation-controls" style={{ display: 'flex', gap: '8px', padding: '12px' }}>
      <button onClick={onRun} disabled={running}>
        {running ? 'Simulando…' : '▶ Simular'}
      </button>
      <button onClick={onReset}>↺ Reiniciar</button>
    </div>
  );
}

export default SimulationControls;
