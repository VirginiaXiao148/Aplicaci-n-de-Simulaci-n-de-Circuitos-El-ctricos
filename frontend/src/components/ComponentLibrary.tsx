import React from 'react';
import type { ComponentType } from '../types/circuit';
import ComponentSVG from './ComponentSVG';

interface ComponentDef {
  type: ComponentType;
  label: string;
  defaultValue: number;
  unit: string;
  description: string;
}

const COMPONENTS: ComponentDef[] = [
  { type: 'resistor', label: 'Resistor', defaultValue: 1000, unit: 'Ω', description: 'R' },
  { type: 'capacitor', label: 'Capacitor', defaultValue: 1e-6, unit: 'F', description: 'C' },
  { type: 'inductor', label: 'Inductor', defaultValue: 1e-3, unit: 'H', description: 'L' },
  { type: 'voltage_source', label: 'Voltage Source', defaultValue: 5, unit: 'V', description: 'V' },
  { type: 'current_source', label: 'Current Source', defaultValue: 0.01, unit: 'A', description: 'I' },
  { type: 'ground', label: 'Ground', defaultValue: 0, unit: '', description: 'GND' },
];

interface ComponentLibraryProps {
  onDragStart?: (type: ComponentType, defaultValue: number, unit: string) => void;
}

const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ onDragStart }) => {
  const handleDragStart = (
    e: React.DragEvent,
    type: ComponentType,
    defaultValue: number,
    unit: string
  ) => {
    e.dataTransfer.setData('componentType', type);
    e.dataTransfer.setData('defaultValue', String(defaultValue));
    e.dataTransfer.setData('unit', unit);
    onDragStart?.(type, defaultValue, unit);
  };

  return (
    <aside
      style={{
        width: 170,
        minWidth: 170,
        background: '#1e293b',
        borderRight: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 8px',
        gap: 6,
        overflowY: 'auto',
      }}
    >
      <div style={{ color: '#60a5fa', fontWeight: 700, fontSize: 13, marginBottom: 8, letterSpacing: 1 }}>
        COMPONENTS
      </div>

      {COMPONENTS.map((comp) => (
        <div
          key={comp.type}
          draggable
          onDragStart={(e) => handleDragStart(e, comp.type, comp.defaultValue, comp.unit)}
          style={{
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: 8,
            padding: '8px 6px 4px',
            cursor: 'grab',
            userSelect: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = '#60a5fa';
            (e.currentTarget as HTMLDivElement).style.background = '#1e3a5f';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = '#334155';
            (e.currentTarget as HTMLDivElement).style.background = '#0f172a';
          }}
        >
          <ComponentSVG
            type={comp.type}
            value={0}
            unit={comp.unit}
            label=""
            compact
          />
          <div style={{ color: '#cbd5e1', fontSize: 11, marginTop: 2, fontWeight: 600 }}>
            {comp.label}
          </div>
          <div style={{ color: '#64748b', fontSize: 10 }}>({comp.description})</div>
        </div>
      ))}

      <div style={{ marginTop: 16, color: '#475569', fontSize: 10, lineHeight: 1.6 }}>
        <strong style={{ color: '#60a5fa' }}>Tips:</strong><br />
        • Drag to canvas<br />
        • Click terminal to wire<br />
        • Click to select<br />
        • Del to remove<br />
        • R to rotate
      </div>
    </aside>
  );
};

export default ComponentLibrary;
