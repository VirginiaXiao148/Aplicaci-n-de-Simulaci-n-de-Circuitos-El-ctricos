import React from 'react';
import { CircuitCanvas, ElementToolbar } from '../components/Circuit';
import { SimulationControls, PropertiesPanel } from '../components/Controls';
import { ResultsTable, Spinner } from '../components/shared';
import useCircuit from '../hooks/useCircuit';
import useSimulation from '../hooks/useSimulation';

function SimulatorPage() {
  const { elements, connections, addElement, updateElement, reset } = useCircuit();
  const { results, loading, error, simulate, clearResults } = useSimulation();
  const [selected, setSelected] = React.useState(null);

  const handleRun = () => simulate({ elements, connections });
  const handleReset = () => { reset(); clearResults(); setSelected(null); };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: '200px', borderRight: '1px solid #333', padding: '8px' }}>
        <ElementToolbar onAddElement={addElement} />
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <SimulationControls onRun={handleRun} onReset={handleReset} running={loading} />
        <CircuitCanvas elements={elements} onSelect={setSelected} onUpdateElement={updateElement} />
        {error && <p style={{ color: 'red', padding: '8px' }}>{error}</p>}
        {loading && <Spinner />}
        <ResultsTable results={results} />
      </main>

      <aside style={{ width: '240px', borderLeft: '1px solid #333' }}>
        <PropertiesPanel
          element={selected}
          onChange={(updated) => updateElement(updated.id, updated)}
        />
      </aside>
    </div>
  );
}

export default SimulatorPage;
