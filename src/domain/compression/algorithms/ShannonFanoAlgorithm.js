import { AlgorithmId } from '../CompressionAlgorithmContract'
import { BaseCompressionAlgorithm } from '../BaseCompressionAlgorithm'

export class ShannonFanoAlgorithm extends BaseCompressionAlgorithm {
  constructor() {
    super(AlgorithmId.SHANNON_FANO, 'Shannon-Fano')
  }

  async run(input) {
    this.validateInput(input)
    return this.createPendingResult(
      'Contrato definido. Pendiente implementación real del árbol Shannon-Fano.',
    )
  }
}
