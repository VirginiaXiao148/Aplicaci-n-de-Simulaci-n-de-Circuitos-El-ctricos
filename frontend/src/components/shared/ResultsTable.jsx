import React from 'react';

/**
 * ResultsTable – displays simulation output (voltages, currents, power).
 * Props:
 *   results – array of { label, value, unit }
 */
function ResultsTable({ results = [] }) {
  if (!results.length) return null;

  return (
    <table className="results-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>Nodo / Rama</th>
          <th>Valor</th>
          <th>Unidad</th>
        </tr>
      </thead>
      <tbody>
        {results.map((row, i) => (
          <tr key={i}>
            <td>{row.label}</td>
            <td>{row.value}</td>
            <td>{row.unit}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ResultsTable;
