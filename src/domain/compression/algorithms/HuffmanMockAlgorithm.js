import { AlgorithmId } from '../CompressionAlgorithmContract'
import { BaseCompressionAlgorithm } from '../BaseCompressionAlgorithm'

const calculateEntropy = (text) => {
  const frequencyMap = new Map()
  for (const character of text) {
    frequencyMap.set(character, (frequencyMap.get(character) ?? 0) + 1)
  }

  const total = text.length
  let entropy = 0

  frequencyMap.forEach((count) => {
    const probability = count / total
    entropy -= probability * Math.log2(probability)
  })

  return entropy
}

export class HuffmanMockAlgorithm extends BaseCompressionAlgorithm {
  constructor() {
    super(AlgorithmId.HUFFMAN, 'Huffman')
  }

  async run(input) {
    this.validateInput(input)

    const start = performance.now()
    const text = input.text
    const entropy = calculateEntropy(text)
    const uniqueSymbols = new Set(text).size
    const diversityFactor = Math.min(uniqueSymbols / 64, 1)
    const normalizedLength = Math.min(text.length / 2000, 1)

    const estimatedRatio = 1.45 + normalizedLength * 0.35 - diversityFactor * 0.18
    const averageCodeLength = entropy + 0.28
    const executionTimeMs = Math.max(performance.now() - start, 0.8)

    return this.createReadyResult(
      {
        compressionRatio: Number(estimatedRatio.toFixed(3)),
        averageCodeLength: Number(averageCodeLength.toFixed(3)),
        executionTimeMs: Number(executionTimeMs.toFixed(3)),
        entropy: Number(entropy.toFixed(3)),
      },
      `Implementación mock funcional. Orden de fuente extendida recibido: ${input.extensionOrder}.`,
    )
  }
}
