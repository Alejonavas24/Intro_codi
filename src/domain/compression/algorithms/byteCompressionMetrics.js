import { buildFrequencyTable, calculateEntropy, roundMetric } from './codingMetrics'

const bitsToBytes = (bits) => {
  const paddedBits = bits.padEnd(Math.ceil(bits.length / 8) * 8, '0')
  const bytes = []

  for (let index = 0; index < paddedBits.length; index += 8) {
    bytes.push(Number.parseInt(paddedBits.slice(index, index + 8), 2))
  }

  return new Uint8Array(bytes)
}

export const resolveInputBytes = (input) => {
  if (input.sourceBytes instanceof Uint8Array) {
    return input.sourceBytes
  }

  if (input.sourceMetadata?.mode === 'bits') {
    return bitsToBytes(input.symbols.join(''))
  }

  const text = input.sourceText ?? input.text ?? input.symbols.join('')
  return new TextEncoder().encode(text)
}

export const buildByteCompressionMetrics = (input, bytes, compressedSizeBytes, startTime) => {
  const frequencyTable = buildFrequencyTable(Array.from(bytes))
  const originalBits = input.originalBitLength ?? bytes.byteLength * 8
  const encodedBits = compressedSizeBytes * 8

  return {
    compressionRatio: roundMetric(originalBits / encodedBits),
    averageCodeLength: roundMetric(encodedBits / bytes.length),
    executionTimeMs: roundMetric(Math.max(performance.now() - startTime, 0.001)),
    entropy: roundMetric(calculateEntropy(frequencyTable, bytes.length)),
    compressedSizeBytes,
  }
}
