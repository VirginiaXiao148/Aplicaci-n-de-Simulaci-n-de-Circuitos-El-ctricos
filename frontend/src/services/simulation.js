import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Send circuit data to the /simulate endpoint and return the simulation results.
 *
 * @param {Object} circuitData - The circuit description to simulate.
 *   Expected shape: { elements: Array<Object>, connections: Array<Object> }
 * @returns {Promise<Object>} The simulation results returned by the backend.
 * @throws Will throw an error if the request fails.
 */
export async function simulateCircuit(circuitData) {
  const response = await axios.post(`${BASE_URL}/simulate`, circuitData);
  return response.data;
}
