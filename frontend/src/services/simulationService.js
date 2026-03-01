import axios from 'axios';

const BASE_URL = '/api/v1';

/**
 * simulationService – wraps all API calls related to circuit simulation.
 */

/**
 * Run a simulation for the given circuit.
 * @param {Object} circuit  - { elements: [], connections: [] }
 * @returns {Promise<Object>} - { results: [{label, value, unit}] }
 */
export async function runSimulation(circuit) {
  const response = await axios.post(`${BASE_URL}/simulation/run`, circuit);
  return response.data;
}

/**
 * Fetch the list of saved circuits for the current user.
 * @returns {Promise<Array>}
 */
export async function getCircuits() {
  const response = await axios.get(`${BASE_URL}/circuits`);
  return response.data;
}

/**
 * Save a circuit to the backend.
 * @param {Object} circuit
 * @returns {Promise<Object>} saved circuit with assigned id
 */
export async function saveCircuit(circuit) {
  const response = await axios.post(`${BASE_URL}/circuits`, circuit);
  return response.data;
}

/**
 * Delete a circuit by id.
 * @param {string|number} id
 */
export async function deleteCircuit(id) {
  await axios.delete(`${BASE_URL}/circuits/${id}`);
}
