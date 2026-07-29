import { AlgorithmId } from '../CompressionAlgorithmContract'
import { BaseCompressionAlgorithm } from '../BaseCompressionAlgorithm'
import { buildByteCompressionMetrics, resolveInputBytes } from './byteCompressionMetrics'

const countLzwCodes = (bytes) => {
  if (bytes.length === 0) {
    return 0
  }

  const dictionary = new Map()
  let nextCode = 256
  let prefixCode = bytes[0]
  let outputCodes = 0

  for (let index = 1; index < bytes.length; index += 1) {
    const byte = bytes[index]
    const key = `${prefixCode}:${byte}`
    const knownCode = dictionary.get(key)

    if (knownCode !== undefined) {
      prefixCode = knownCode
      continue
    }

    outputCodes += 1

    if (nextCode < 4096) {
      dictionary.set(key, nextCode)
      nextCode += 1
    }

    prefixCode = byte
  }

  return outputCodes + 1
}

export class LzwAlgorithm extends BaseCompressionAlgorithm {
  constructor() {
    super(AlgorithmId.LZW, 'LZW (12 bits)')
  }

  async run(input) {
    this.validateInput(input)

    const start = performance.now()
    const bytes = resolveInputBytes(input)
    const codeCount = countLzwCodes(bytes)
    const compressedSizeBytes = Math.ceil((codeCount * 12) / 8)
    const metrics = buildByteCompressionMetrics(input, bytes, compressedSizeBytes, start)

    return this.createReadyResult(
      metrics,
      `LZW generó ${codeCount} códigos de 12 bits para ${bytes.length} bytes. Detecta secuencias repetidas sin necesitar una tabla externa.`,
    )
  }
}
