import { AlgorithmId } from '../CompressionAlgorithmContract'
import { BaseCompressionAlgorithm } from '../BaseCompressionAlgorithm'
import { buildCompressionMetrics, buildFrequencyTable, resolveSymbols } from './codingMetrics'

const buildHuffmanTree = (frequencyTable) => {
  const queue = frequencyTable.map(({ symbol, count, index }) => ({
    symbol,
    count,
    order: index,
    left: null,
    right: null,
  }))

  while (queue.length > 1) {
    queue.sort((first, second) => first.count - second.count || first.order - second.order)

    const left = queue.shift()
    const right = queue.shift()

    queue.push({
      symbol: null,
      count: left.count + right.count,
      order: Math.min(left.order, right.order),
      left,
      right,
    })
  }

  return queue[0]
}

const buildCodeMap = (node, prefix = '', codeMap = new Map()) => {
  if (!node.left && !node.right) {
    codeMap.set(node.symbol, prefix || '0')
    return codeMap
  }

  buildCodeMap(node.left, `${prefix}0`, codeMap)
  buildCodeMap(node.right, `${prefix}1`, codeMap)

  return codeMap
}

export class HuffmanMockAlgorithm extends BaseCompressionAlgorithm {
  constructor() {
    super(AlgorithmId.HUFFMAN, 'Huffman')
  }

  async run(input) {
    this.validateInput(input)

    const start = performance.now()
    const symbols = resolveSymbols(input)
    const frequencyTable = buildFrequencyTable(symbols)
    const huffmanTree = buildHuffmanTree(frequencyTable)
    const codeMap = buildCodeMap(huffmanTree)
    const { metrics, encodedBits, originalBits } = buildCompressionMetrics(
      input,
      frequencyTable,
      codeMap,
      start,
    )

    return this.createReadyResult(
      metrics,
      `Implementacion real de Huffman. ${symbols.length} simbolos procesados, ${frequencyTable.length} simbolos unicos, ${encodedBits} bits codificados frente a ${originalBits} bits originales.`,
    )
  }
}
