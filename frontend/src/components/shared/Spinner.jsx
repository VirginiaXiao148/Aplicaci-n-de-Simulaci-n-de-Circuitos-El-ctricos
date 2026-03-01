import React from 'react';

/**
 * Spinner – generic loading indicator.
 */
function Spinner({ size = 32 }) {
  return (
    <div
      className="spinner"
      style={{
        width: size,
        height: size,
        border: '4px solid #333',
        borderTop: '4px solid #7b61ff',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );
}

export default Spinner;
