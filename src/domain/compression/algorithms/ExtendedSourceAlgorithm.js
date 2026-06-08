import { AlgorithmId } from '../CompressionAlgorithmContract'
import { BaseCompressionAlgorithm } from '../BaseCompressionAlgorithm'

export class ExtendedSourceAlgorithm extends BaseCompressionAlgorithm {
  constructor() {
    super(AlgorithmId.EXTENDED_SOURCE, 'Fuentes Extendidas')
  }

  async run(input) {
    this.validateInput(input)
    return this.createPendingResult(
      `Contrato definido. Pendiente implementación real para orden ${input.extensionOrder}.`,
    )
  }
}
