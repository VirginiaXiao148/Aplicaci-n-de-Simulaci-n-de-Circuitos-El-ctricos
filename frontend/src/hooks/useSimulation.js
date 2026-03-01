import { useState, useCallback } from 'react';
import { runSimulation } from '../services/simulationService';

/**
 * useSimulation – triggers the backend simulation and stores results.
 */
function useSimulation() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const simulate = useCallback(async (circuitPayload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await runSimulation(circuitPayload);
      setResults(data.results ?? []);
    } catch (err) {
      setError(err.message || 'Error al ejecutar la simulación');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => setResults([]), []);

  return { results, loading, error, simulate, clearResults };
}

export default useSimulation;
