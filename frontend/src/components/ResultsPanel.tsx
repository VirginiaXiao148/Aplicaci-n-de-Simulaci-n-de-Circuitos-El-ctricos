import React from 'react';
import type { SimulationResult, Circuit } from '../types/circuit';

interface ResultsPanelProps {
  result: SimulationResult | null;
  circuit: Circuit;
  onSimulate: () => void;
}

function fmt(n: number): string {
  if (Math.abs(n) < 1e-10) return '0';
  return n.toPrecision(4);
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ result, circuit, onSimulate }) => {
  const cellStyle: React.CSSProperties = {
    padding: '5px 8px',
    borderBottom: '1px solid #1e293b',
    color: '#cbd5e1',
    fontSize: 12,
  };

  const headerCellStyle: React.CSSProperties = {
    ...cellStyle,
    color: '#60a5fa',
    fontWeight: 700,
    background: '#0f172a',
    fontSize: 11,
    letterSpacing: 0.5,
  };

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ color: '#60a5fa', fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>
        SIMULATION
      </div>

      <button
        onClick={onSimulate}
        style={{
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '9px 0',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: 0.5,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.opacity = '0.85')}
        onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.opacity = '1')}
      >
        ▶ Run DC Analysis
      </button>

      {result && !result.success && (
        <div
          style={{
            background: '#450a0a',
            border: '1px solid #991b1b',
            borderRadius: 8,
            padding: '10px 12px',
            color: '#fca5a5',
            fontSize: 12,
          }}
        >
          <strong>Error:</strong> {result.error}
        </div>
      )}

      {result && result.success && (
        <>
          {/* Node voltages */}
          <div>
            <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 6, fontWeight: 600 }}>
              NODE VOLTAGES
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headerCellStyle}>Node</th>
                  <th style={headerCellStyle}>Voltage (V)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(result.nodeVoltages).map(([node, v]) => (
                  <tr key={node}>
                    <td style={cellStyle}>N{node}</td>
                    <td style={{ ...cellStyle, color: '#34d399', fontFamily: 'monospace' }}>
                      {fmt(v)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Branch currents */}
          {Object.keys(result.branchCurrents).length > 0 && (
            <div>
              <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 6, fontWeight: 600 }}>
                BRANCH CURRENTS
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={headerCellStyle}>Component</th>
                    <th style={headerCellStyle}>Current (A)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.branchCurrents).map(([compId, i]) => {
                    const comp = circuit.components.find((c) => c.id === compId);
                    return (
                      <tr key={compId}>
                        <td style={cellStyle}>{comp?.label || compId.slice(0, 6)}</td>
                        <td style={{ ...cellStyle, color: '#fbbf24', fontFamily: 'monospace' }}>
                          {fmt(i)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Power dissipation */}
          {Object.keys(result.powerDissipation).length > 0 && (
            <div>
              <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 6, fontWeight: 600 }}>
                POWER DISSIPATION
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={headerCellStyle}>Component</th>
                    <th style={headerCellStyle}>Power (W)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.powerDissipation).map(([compId, p]) => {
                    const comp = circuit.components.find((c) => c.id === compId);
                    return (
                      <tr key={compId}>
                        <td style={cellStyle}>{comp?.label || compId.slice(0, 6)}</td>
                        <td
                          style={{
                            ...cellStyle,
                            color: p < 0 ? '#f87171' : '#a78bfa',
                            fontFamily: 'monospace',
                          }}
                        >
                          {fmt(p)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResultsPanel;
