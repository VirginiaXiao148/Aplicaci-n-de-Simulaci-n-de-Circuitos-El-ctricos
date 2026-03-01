import React from 'react';

/**
 * ElementToolbar – palette of circuit elements the user can drag onto the canvas.
 */
const ELEMENTS = [
  { type: 'resistor', label: 'Resistor' },
  { type: 'capacitor', label: 'Capacitor' },
  { type: 'inductor', label: 'Inductor' },
  { type: 'voltage_source', label: 'Fuente de Voltaje' },
  { type: 'current_source', label: 'Fuente de Corriente' },
  { type: 'ground', label: 'Tierra' },
];

function ElementToolbar({ onAddElement }) {
  return (
    <div className="element-toolbar">
      <h3>Componentes</h3>
      <ul>
        {ELEMENTS.map((el) => (
          <li
            key={el.type}
            draggable
            onClick={() => onAddElement && onAddElement(el.type)}
            style={{ cursor: 'pointer', padding: '8px', margin: '4px 0', background: '#1e1e3a', borderRadius: '4px' }}
          >
            {el.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ElementToolbar;
