import React, { useState } from 'react';

/** Default stroke colour for the wire */
const WIRE_COLOR = '#00e5ff';

/** Thickness of the wire line in pixels */
const WIRE_STROKE_WIDTH = 2;

/**
 * Wire – renders an SVG line (cable) between two user-defined points.
 *
 * When used as a controlled component, pass x1/y1/x2/y2 and onChange.
 * When used standalone, omit those props and the component manages its own state.
 *
 * Props:
 *   x1, y1, x2, y2   – coordinates of the wire endpoints (numbers)
 *   onChange          – callback({ x1, y1, x2, y2 }) when coordinates change
 *   width             – SVG viewport width  (default 400)
 *   height            – SVG viewport height (default 300)
 *   color             – wire stroke colour  (default '#00e5ff')
 */
function Wire({
  x1: propX1,
  y1: propY1,
  x2: propX2,
  y2: propY2,
  onChange,
  width = 400,
  height = 300,
  color = WIRE_COLOR,
}) {
  const isControlled =
    propX1 !== undefined &&
    propY1 !== undefined &&
    propX2 !== undefined &&
    propY2 !== undefined;

  const [localCoords, setLocalCoords] = useState({ x1: 50, y1: 150, x2: 350, y2: 150 });

  const coords = isControlled
    ? { x1: propX1, y1: propY1, x2: propX2, y2: propY2 }
    : localCoords;

  const handleChange = (field) => (e) => {
    const value = Number(e.target.value);
    const next = { ...coords, [field]: value };
    if (!isControlled) {
      setLocalCoords(next);
    }
    if (onChange) {
      onChange(next);
    }
  };

  const inputStyle = {
    width: '60px',
    marginRight: '8px',
    background: '#1e1e3a',
    color: '#ffffff',
    border: '1px solid #444',
    borderRadius: '4px',
    padding: '2px 4px',
  };

  const labelStyle = { marginRight: '4px', color: '#aaaaaa', fontSize: '13px' };

  return (
    <div style={{ display: 'inline-block' }}>
      {/* Coordinate inputs */}
      <div style={{ marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
        {[
          { label: 'x1', field: 'x1', max: width },
          { label: 'y1', field: 'y1', max: height },
          { label: 'x2', field: 'x2', max: width },
          { label: 'y2', field: 'y2', max: height },
        ].map(({ label, field, max }) => (
          <span key={field}>
            <label style={labelStyle}>{label}:</label>
            <input
              type="number"
              min={0}
              max={max}
              value={coords[field]}
              onChange={handleChange(field)}
              style={inputStyle}
              aria-label={label}
            />
          </span>
        ))}
      </div>

      {/* SVG wire */}
      <svg
        width={width}
        height={height}
        style={{ background: '#0d0d1a', border: '1px solid #333', display: 'block' }}
        aria-label="Wire connection visualization"
      >
        {/* Endpoint circles */}
        <circle cx={coords.x1} cy={coords.y1} r={4} fill={color} />
        <circle cx={coords.x2} cy={coords.y2} r={4} fill={color} />

        {/* Wire line */}
        <line
          x1={coords.x1}
          y1={coords.y1}
          x2={coords.x2}
          y2={coords.y2}
          stroke={color}
          strokeWidth={WIRE_STROKE_WIDTH}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default Wire;
