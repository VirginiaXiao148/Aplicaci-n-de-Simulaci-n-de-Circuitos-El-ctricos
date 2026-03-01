import axios from 'axios';

const BASE_URL = '/api/v1';
const BACKEND_URL = 'http://localhost:8000/api/v1';

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
 * Simulate circuit with components array - includes error handling
 * @param {Array} components - Array of circuit components
 * @returns {Promise<Object>} - Simulation results or error object
 */
export async function simulateCircuitWithComponents(components) {
  try {
    // Validate input
    if (!Array.isArray(components)) {
      throw new Error('Los componentes deben ser un array');
    }

    if (components.length === 0) {
      throw new Error('El array de componentes no puede estar vacío');
    }

    // Send request to backend
    const response = await axios.post(
      `${BACKEND_URL}/simulation/run`,
      { components },
      {
        timeout: 10000, // 10 seconds timeout
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'Tiempo de espera agotado. El servidor tardó demasiado en responder.',
      };
    }

    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      return {
        success: false,
        error: 'No se pudo conectar al servidor. Verifica que el backend esté ejecutándose en el puerto 8000.',
      };
    }

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        error: error.response.data?.message || `Error del servidor: ${error.response.status}`,
        status: error.response.status,
      };
    }

    // Generic error
    return {
      success: false,
      error: error.message || 'Error desconocido al ejecutar la simulación',
    };
  }
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
