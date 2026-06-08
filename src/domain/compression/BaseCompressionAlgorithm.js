import { AlgorithmStatus } from './CompressionAlgorithmContract'

/**
 * Clase base para implementar algoritmos concretos de compresión.
 * @description
 * Centraliza comportamiento común (metadata, validación y construcción
 * de resultados) para evitar duplicación en cada algoritmo.
 */
export class BaseCompressionAlgorithm {
  /**
   * @param {string} id Identificador técnico del algoritmo.
   * @param {string} name Nombre legible para UI/reportes.
   */
  constructor(id, name) {
    this.id = id
    this.name = name
  }

  /**
   * Devuelve metadata mínima del algoritmo.
   * @returns {{id: string, name: string}}
   */
  getMetadata() {
    return {
      id: this.id,
      name: this.name,
    }
  }

  /**
   * Valida precondiciones de entrada para cualquier implementación.
   * @param {{text?: string}} input
   * @throws {Error} si el texto está vacío o no es válido.
   */
  validateInput(input) {
    if (!input || typeof input.text !== 'string' || !input.text.trim()) {
      throw new Error('Debes ingresar un texto para ejecutar la comparación.')
    }
  }

  /**
   * Construye resultado estándar cuando el algoritmo no está implementado.
   * @param {string} note Mensaje de estado para UI.
   * @returns {{id: string, name: string, status: 'pending', metrics: null, note: string}}
   */
  createPendingResult(note) {
    return {
      id: this.id,
      name: this.name,
      status: AlgorithmStatus.PENDING,
      metrics: null,
      note,
    }
  }

  /**
   * Construye resultado estándar con métricas disponibles.
   * @param {{compressionRatio: number, averageCodeLength: number, executionTimeMs: number, entropy: number}} metrics
   * @param {string} note Contexto adicional del cálculo.
   * @returns {{id: string, name: string, status: 'ready', metrics: object, note: string}}
   */
  createReadyResult(metrics, note) {
    return {
      id: this.id,
      name: this.name,
      status: AlgorithmStatus.READY,
      metrics,
      note,
    }
  }

  /**
   * Método abstracto.
   * Cada algoritmo concreto debe implementar su propia ejecución.
   * @returns {Promise<never>}
   */
  async run() {
    throw new Error('Cada algoritmo debe implementar run(input).')
  }
}
