import React from 'react';

/**
 * CircuitCanvas – renders the interactive circuit diagram on an SVG canvas.
 * Props:
 *   elements  – array of circuit element objects
 *   onSelect  – callback when an element is clicked
 */
function CircuitCanvas({ elements = [], onSelect }) {
  return (
    <svg
      className="circuit-canvas"
      width="100%"
      height="600"
      style={{ background: '#0d0d1a', border: '1px solid #333' }}
    >
      {elements.map((el) => (
        <g key={el.id} onClick={() => onSelect && onSelect(el)}>
          {/* Individual element rendering delegated to element-specific components */}
        </g>
      ))}
    </svg>
  );
}

export default CircuitCanvas;
