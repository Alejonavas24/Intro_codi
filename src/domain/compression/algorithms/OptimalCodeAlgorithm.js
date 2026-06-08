import { AlgorithmId } from '../CompressionAlgorithmContract'
import { BaseCompressionAlgorithm } from '../BaseCompressionAlgorithm'

export class OptimalCodeAlgorithm extends BaseCompressionAlgorithm {
  constructor() {
    super(AlgorithmId.OPTIMAL_CODE, 'Códigos Óptimos')
  }

  async run(input) {
    this.validateInput(input)
    return this.createPendingResult(
      'Contrato definido. Pendiente implementación real de códigos óptimos.',
    )
  }
}
