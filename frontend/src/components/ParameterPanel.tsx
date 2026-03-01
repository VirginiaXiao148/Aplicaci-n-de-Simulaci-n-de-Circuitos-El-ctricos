import React from 'react';
import type { CircuitComponent } from '../types/circuit';

interface ParameterPanelProps {
  component: CircuitComponent | null;
  onUpdate: (id: string, changes: Partial<CircuitComponent>) => void;
}

const UNIT_MAP: Record<string, string> = {
  resistor: 'Ω',
  capacitor: 'F',
  inductor: 'H',
  voltage_source: 'V',
  current_source: 'A',
  ground: '',
  wire: '',
};

const LABEL_MAP: Record<string, string> = {
  resistor: 'Resistance',
  capacitor: 'Capacitance',
  inductor: 'Inductance',
  voltage_source: 'Voltage',
  current_source: 'Current',
  ground: '',
  wire: '',
};

const ParameterPanel: React.FC<ParameterPanelProps> = ({ component, onUpdate }) => {
  if (!component) {
    return (
      <div
        style={{
          padding: 16,
          color: '#475569',
          fontSize: 13,
          textAlign: 'center',
          marginTop: 20,
        }}
      >
        Select a component to edit its parameters.
      </div>
    );
  }

  const showValue = component.type !== 'ground' && component.type !== 'wire';

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ color: '#60a5fa', fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>
        PARAMETERS
      </div>

      <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 12px', border: '1px solid #334155' }}>
        <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>Type</div>
        <div style={{ color: '#e2e8f0', fontWeight: 600, textTransform: 'capitalize' }}>
          {component.type.replace(/_/g, ' ')}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ color: '#94a3b8', fontSize: 11 }}>Label / Name</label>
        <input
          type="text"
          value={component.label}
          onChange={(e) => onUpdate(component.id, { label: e.target.value })}
          style={{
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: 6,
            color: '#e2e8f0',
            padding: '6px 10px',
            fontSize: 13,
            outline: 'none',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#60a5fa')}
          onBlur={(e) => (e.target.style.borderColor = '#334155')}
        />
      </div>

      {showValue && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ color: '#94a3b8', fontSize: 11 }}>
            {LABEL_MAP[component.type]} ({UNIT_MAP[component.type]})
          </label>
          <input
            type="number"
            value={component.value}
            step="any"
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) onUpdate(component.id, { value: val });
            }}
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 6,
              color: '#e2e8f0',
              padding: '6px 10px',
              fontSize: 13,
              outline: 'none',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#60a5fa')}
            onBlur={(e) => (e.target.style.borderColor = '#334155')}
          />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ color: '#94a3b8', fontSize: 11 }}>Position</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="number"
            value={component.position.x}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val))
                onUpdate(component.id, { position: { ...component.position, x: val } });
            }}
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 6,
              color: '#e2e8f0',
              padding: '6px 8px',
              fontSize: 12,
              width: '50%',
              outline: 'none',
            }}
            placeholder="X"
          />
          <input
            type="number"
            value={component.position.y}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val))
                onUpdate(component.id, { position: { ...component.position, y: val } });
            }}
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 6,
              color: '#e2e8f0',
              padding: '6px 8px',
              fontSize: 12,
              width: '50%',
              outline: 'none',
            }}
            placeholder="Y"
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ color: '#94a3b8', fontSize: 11 }}>Rotation</label>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {[0, 90, 180, 270].map((deg) => (
            <button
              key={deg}
              onClick={() => onUpdate(component.id, { rotation: deg })}
              style={{
                flex: 1,
                padding: '4px 0',
                borderRadius: 5,
                border: '1px solid',
                borderColor: component.rotation === deg ? '#60a5fa' : '#334155',
                background: component.rotation === deg ? '#1e3a5f' : '#0f172a',
                color: component.rotation === deg ? '#60a5fa' : '#94a3b8',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              {deg}°
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParameterPanel;
