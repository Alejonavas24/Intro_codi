import { AlgorithmId } from '../CompressionAlgorithmContract'
import { BaseCompressionAlgorithm } from '../BaseCompressionAlgorithm'
import { buildByteCompressionMetrics, resolveInputBytes } from './byteCompressionMetrics'

const compressWithDeflate = async (bytes) => {
  if (typeof CompressionStream === 'undefined') {
    throw new Error('Este navegador no ofrece soporte para CompressionStream.')
  }

  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'))
  const compressedBuffer = await new Response(stream).arrayBuffer()
  return compressedBuffer.byteLength
}

export class DeflateAlgorithm extends BaseCompressionAlgorithm {
  constructor() {
    super(AlgorithmId.DEFLATE, 'Deflate')
  }

  async run(input) {
    this.validateInput(input)

    const start = performance.now()
    const bytes = resolveInputBytes(input)
    const compressedSizeBytes = await compressWithDeflate(bytes)
    const metrics = buildByteCompressionMetrics(input, bytes, compressedSizeBytes, start)

    return this.createReadyResult(
      metrics,
      `Deflate combinó búsqueda de secuencias repetidas y codificación Huffman. Produjo ${compressedSizeBytes} bytes a partir de ${bytes.length} bytes.`,
    )
  }
}
