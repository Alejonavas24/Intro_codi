/**
 * Estados posibles para el resultado de una ejecución.
 * - READY: algoritmo implementado y métricas disponibles.
 * - PENDING: contrato definido pero implementación pendiente.
 */
export const AlgorithmStatus = Object.freeze({
  READY: 'ready',
  PENDING: 'pending',
})

/**
 * Identificadores estables de algoritmos.
 * Se usan como clave técnica en UI, servicios y resultados.
 */
export const AlgorithmId = Object.freeze({
  HUFFMAN: 'huffman',
  SHANNON_FANO: 'shannon-fano',
  OPTIMAL_CODE: 'optimal-code',
  EXTENDED_SOURCE: 'extended-source',
})

/**
 * Entrada estándar para cualquier algoritmo de compresión.
 * @description
 * `extensionOrder` permite que algoritmos basados en fuentes extendidas
 * ajusten su procesamiento sin cambiar el contrato común.
 *
 * @typedef {Object} CompressionInput
 * @property {string} text
 * @property {number} extensionOrder
 */

/**
 * Métricas comparables entre algoritmos.
 * @description
 * Todas las métricas se modelan como números para facilitar ordenamiento,
 * agregaciones y visualización homogénea en la interfaz.
 *
 * @typedef {Object} CompressionMetrics
 * @property {number} compressionRatio
 * @property {number} averageCodeLength
 * @property {number} executionTimeMs
 * @property {number} entropy
 */

/**
 * Resultado normalizado de una ejecución.
 * @description
 * Cuando el estado es `pending`, `metrics` debe ser `null` y `note`
 * explica por qué aún no hay cálculo real.
 *
 * @typedef {Object} CompressionResult
 * @property {string} id
 * @property {string} name
 * @property {'ready' | 'pending'} status
 * @property {CompressionMetrics | null} metrics
 * @property {string} note
 */

/**
 * Contrato público que debe cumplir cualquier algoritmo.
 * @description
 * - `getMetadata` expone identidad para listado y renderizado.
 * - `run` ejecuta el procesamiento y retorna un resultado normalizado.
 *
 * @typedef {Object} CompressionAlgorithm
 * @property {() => { id: string, name: string }} getMetadata
 * @property {(input: CompressionInput) => Promise<CompressionResult>} run
 */
