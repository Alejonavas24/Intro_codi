import { AlgorithmId } from '../CompressionAlgorithmContract'
import { BaseCompressionAlgorithm } from '../BaseCompressionAlgorithm'
import { buildFrequencyTable, calculateEntropy, resolveSymbols, roundMetric } from './codingMetrics'

const byteToBits = (byte) => byte.toString(2).padStart(8, '0')

const resolveInputBits = (input) => {
  if (input.sourceMetadata?.mode === 'bits') {
    return resolveSymbols(input).join('')
  }

  if (input.sourceMetadata?.mode === 'bytes') {
    return resolveSymbols(input).map((symbol) => byteToBits(Number(symbol))).join('')
  }

  const text = input.sourceText ?? input.text ?? resolveSymbols(input).join('')
  return Array.from(new TextEncoder().encode(text), byteToBits).join('')
}

const encodeHamming74Block = ([data1, data2, data3, data4]) => {
  const d1 = Number(data1)
  const d2 = Number(data2)
  const d3 = Number(data3)
  const d4 = Number(data4)
  const parity1 = d1 ^ d2 ^ d4
  const parity2 = d1 ^ d3 ^ d4
  const parity4 = d2 ^ d3 ^ d4

  return `${parity1}${parity2}${d1}${parity4}${d2}${d3}${d4}`
}

const encodeHamming74 = (bits) => {
  const paddingBits = (4 - (bits.length % 4)) % 4
  const paddedBits = bits.padEnd(bits.length + paddingBits, '0')
  let encodedBits = ''

  for (let index = 0; index < paddedBits.length; index += 4) {
    encodedBits += encodeHamming74Block(paddedBits.slice(index, index + 4))
  }

  return { encodedBits, paddingBits }
}

export class HammingAlgorithm extends BaseCompressionAlgorithm {
  constructor() {
    super(AlgorithmId.HAMMING, 'Hamming (7,4)')
  }

  async run(input) {
    this.validateInput(input)

    const start = performance.now()
    const symbols = resolveSymbols(input)
    const inputBits = resolveInputBits(input)
    const { encodedBits, paddingBits } = encodeHamming74(inputBits)
    const frequencyTable = buildFrequencyTable(symbols)
    const entropy = calculateEntropy(frequencyTable, symbols.length)
    const executionTimeMs = Math.max(performance.now() - start, 0.001)

    return this.createReadyResult(
      {
        compressionRatio: roundMetric(inputBits.length / encodedBits.length),
        averageCodeLength: roundMetric(encodedBits.length / inputBits.length),
        executionTimeMs: roundMetric(executionTimeMs),
        entropy: roundMetric(entropy),
        compressedSizeBytes: Math.ceil(encodedBits.length / 8),
      },
      `Codificación Hamming (7,4): ${inputBits.length} bits de datos convertidos en ${encodedBits.length} bits protegidos${paddingBits ? `, con ${paddingBits} bit(s) de relleno` : ''}. Añade redundancia para corregir un error de un bit por bloque; no es un algoritmo de compresión.`,
    )
  }
}
