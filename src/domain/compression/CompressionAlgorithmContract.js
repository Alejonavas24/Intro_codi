/**
 * Estados posibles para el resultado de una ejecucion.
 * - READY: algoritmo implementado y metricas disponibles.
 * - PENDING: contrato definido pero implementacion pendiente.
 */
export const AlgorithmStatus = Object.freeze({
  READY: 'ready',
  PENDING: 'pending',
})

/**
 * Identificadores estables de algoritmos.
 * Se usan como clave tecnica en UI, servicios y resultados.
 */
export const AlgorithmId = Object.freeze({
  HUFFMAN: 'huffman',
  SHANNON_FANO: 'shannon-fano',
  OPTIMAL_CODE: 'optimal-code',
  EXTENDED_SOURCE: 'extended-source',
})

/**
 * Entrada estandar para cualquier algoritmo de compresion.
 *
 * @typedef {Object} CompressionInput
 * @property {Array<string>} symbols Fuente discreta normalizada.
 * @property {number} originalBitLength Tamano original en bits.
 * @property {string} sourceText Texto decodificado o ingresado por el usuario.
 * @property {Object} sourceMetadata Metadata de archivo, modo y estadisticas.
 * @property {string} [text] Compatibilidad temporal con entradas antiguas.
 * @property {number} extensionOrder Orden para algoritmos de fuentes extendidas.
 */

/**
 * Metricas comparables entre algoritmos.
 *
 * @typedef {Object} CompressionMetrics
 * @property {number} compressionRatio
 * @property {number} averageCodeLength
 * @property {number} executionTimeMs
 * @property {number} entropy
 */

/**
 * Resultado normalizado de una ejecucion.
 *
 * @typedef {Object} CompressionResult
 * @property {string} id
 * @property {string} name
 * @property {'ready' | 'pending'} status
 * @property {CompressionMetrics | null} metrics
 * @property {string} note
 */

/**
 * Contrato publico que debe cumplir cualquier algoritmo.
 *
 * @typedef {Object} CompressionAlgorithm
 * @property {() => { id: string, name: string }} getMetadata
 * @property {(input: CompressionInput) => Promise<CompressionResult>} run
 */
