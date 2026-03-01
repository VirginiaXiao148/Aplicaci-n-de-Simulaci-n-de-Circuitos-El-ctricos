/**
 * @fileoverview Type definitions for circuit components.
 */

/**
 * Valid component types for a circuit element.
 * @typedef {'resistencia' | 'capacitor' | 'inductor' | 'fuente_voltaje' | 'fuente_corriente' | 'tierra'} ComponentTipo
 */

/**
 * Represents a single circuit component.
 *
 * @typedef {Object} Component
 * @property {string}        id     - Identificador único del componente.
 * @property {ComponentTipo} tipo   - Tipo de componente del circuito.
 * @property {number}        valor  - Valor numérico del componente.
 * @property {string}        unidad - Unidad del valor (e.g. Ω, F, H, V, A).
 * @property {string[]}      nodos  - Nodos a los que está conectado el componente.
 */

export {};
