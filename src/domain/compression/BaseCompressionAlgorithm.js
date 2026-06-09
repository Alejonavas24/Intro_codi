import { AlgorithmStatus } from './CompressionAlgorithmContract'

/**
 * Clase base para implementar algoritmos concretos de compresion.
 */
export class BaseCompressionAlgorithm {
  constructor(id, name) {
    this.id = id
    this.name = name
  }

  getMetadata() {
    return {
      id: this.id,
      name: this.name,
    }
  }

  validateInput(input) {
    const hasSymbols = Array.isArray(input?.symbols) && input.symbols.length > 0
    const hasText = typeof input?.text === 'string' && input.text.trim()

    if (!hasSymbols && !hasText) {
      throw new Error('Debes ingresar una senal para ejecutar la comparacion.')
    }
  }

  createPendingResult(note) {
    return {
      id: this.id,
      name: this.name,
      status: AlgorithmStatus.PENDING,
      metrics: null,
      note,
    }
  }

  createReadyResult(metrics, note) {
    return {
      id: this.id,
      name: this.name,
      status: AlgorithmStatus.READY,
      metrics,
      note,
    }
  }

  async run() {
    throw new Error('Cada algoritmo debe implementar run(input).')
  }
}
