import { AlgorithmId } from '../CompressionAlgorithmContract'
import { BaseCompressionAlgorithm } from '../BaseCompressionAlgorithm'
import { buildByteCompressionMetrics, resolveInputBytes } from './byteCompressionMetrics'

const countRuns = (bytes) => {
  let runs = 0
  let index = 0

  while (index < bytes.length) {
    const value = bytes[index]
    let count = 1

    while (index + count < bytes.length && bytes[index + count] === value && count < 255) {
      count += 1
    }

    runs += 1
    index += count
  }

  return runs
}

export class RleAlgorithm extends BaseCompressionAlgorithm {
  constructor() {
    super(AlgorithmId.RLE, 'RLE')
  }

  async run(input) {
    this.validateInput(input)

    const start = performance.now()
    const bytes = resolveInputBytes(input)
    const runs = countRuns(bytes)
    const compressedSizeBytes = runs * 2
    const metrics = buildByteCompressionMetrics(input, bytes, compressedSizeBytes, start)

    return this.createReadyResult(
      metrics,
      `RLE agrupó ${bytes.length} bytes en ${runs} corridas. Cada corrida almacena un byte de valor y uno de repetición; funciona mejor en imágenes con grandes áreas de color uniforme.`,
    )
  }
}
