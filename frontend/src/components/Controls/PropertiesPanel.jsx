import React from 'react';

/**
 * PropertiesPanel – shows and edits properties of the selected circuit element.
 * Props:
 *   element   – the selected element object (or null)
 *   onChange  – callback(updatedElement) when a property changes
 */
function PropertiesPanel({ element, onChange }) {
  if (!element) {
    return (
      <div className="properties-panel" style={{ padding: '12px' }}>
        <p>Selecciona un componente para ver sus propiedades.</p>
      </div>
    );
  }

  const handleChange = (key, value) => {
    onChange && onChange({ ...element, properties: { ...element.properties, [key]: value } });
  };

  return (
    <div className="properties-panel" style={{ padding: '12px' }}>
      <h3>Propiedades: {element.type}</h3>
      {Object.entries(element.properties || {}).map(([key, value]) => (
        <label key={key} style={{ display: 'block', margin: '8px 0' }}>
          {key}:
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(key, parseFloat(e.target.value))}
            style={{ marginLeft: '8px', width: '80px' }}
          />
        </label>
      ))}
    </div>
  );
}

export default PropertiesPanel;
