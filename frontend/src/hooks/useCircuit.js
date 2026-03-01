import { useState, useCallback } from 'react';
import { generateId } from '../utils/circuitUtils';

/**
 * useCircuit – manages the local state of circuit elements and connections.
 */
function useCircuit() {
  const [elements, setElements] = useState([]);
  const [connections, setConnections] = useState([]);

  const addElement = useCallback((type, position = { x: 100, y: 100 }) => {
    const newElement = {
      id: generateId(type),
      type,
      position,
      properties: getDefaultProperties(type),
    };
    setElements((prev) => [...prev, newElement]);
  }, []);

  const updateElement = useCallback((id, updates) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  }, []);

  const removeElement = useCallback((id) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    setConnections((prev) => prev.filter((c) => c.from !== id && c.to !== id));
  }, []);

  const reset = useCallback(() => {
    setElements([]);
    setConnections([]);
  }, []);

  return { elements, connections, addElement, updateElement, removeElement, reset };
}

function getDefaultProperties(type) {
  const defaults = {
    resistor: { resistance: 1000 },
    capacitor: { capacitance: 0.000001 },
    inductor: { inductance: 0.001 },
    voltage_source: { voltage: 5 },
    current_source: { current: 0.001 },
    ground: {},
  };
  return defaults[type] ?? {};
}

export default useCircuit;
