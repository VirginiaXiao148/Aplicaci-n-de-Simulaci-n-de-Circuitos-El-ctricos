import { create } from 'zustand';

/**
 * useCircuitStore – global Zustand store for the active circuit.
 */
const useCircuitStore = create((set) => ({
  elements: [],
  connections: [],
  selectedElementId: null,

  setElements: (elements) => set({ elements }),
  setConnections: (connections) => set({ connections }),
  selectElement: (id) => set({ selectedElementId: id }),

  addElement: (element) =>
    set((state) => ({ elements: [...state.elements, element] })),

  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    })),

  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      connections: state.connections.filter(
        (c) => c.from !== id && c.to !== id
      ),
    })),

  reset: () => set({ elements: [], connections: [], selectedElementId: null }),
}));

export default useCircuitStore;
