/**
 * circuitUtils – helper functions for circuit element manipulation.
 */

/**
 * Generate a unique element id.
 * @param {string} type
 * @returns {string}
 */
export function generateId(type) {
  return `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Convert a resistance value to a human-readable string with SI prefix.
 * @param {number} ohms
 * @returns {string}
 */
export function formatResistance(ohms) {
  if (ohms >= 1e6) return `${(ohms / 1e6).toFixed(2)} MΩ`;
  if (ohms >= 1e3) return `${(ohms / 1e3).toFixed(2)} kΩ`;
  return `${ohms.toFixed(2)} Ω`;
}

/**
 * Validate that a circuit has at least one source and one ground.
 * @param {Array} elements
 * @returns {{ valid: boolean, message: string }}
 */
export function validateCircuit(elements) {
  const hasSource = elements.some(
    (el) => el.type === 'voltage_source' || el.type === 'current_source'
  );
  const hasGround = elements.some((el) => el.type === 'ground');

  if (!hasSource) return { valid: false, message: 'El circuito necesita al menos una fuente.' };
  if (!hasGround) return { valid: false, message: 'El circuito necesita al menos un nodo de tierra.' };
  return { valid: true, message: '' };
}
