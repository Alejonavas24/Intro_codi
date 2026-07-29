import { AlgorithmId } from '../CompressionAlgorithmContract'
import { BaseCompressionAlgorithm } from '../BaseCompressionAlgorithm'
import { buildCompressionMetrics, buildFrequencyTable, resolveSymbols } from './codingMetrics'

const buildExtendedSymbols = (symbols, order) => {
  const blocks = []

  for (let index = 0; index < symbols.length; index += order) {
    blocks.push(JSON.stringify(symbols.slice(index, index + order)))
  }

  return blocks
}

const buildHuffmanCodeMap = (frequencyTable) => {
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

  const codeMap = new Map()

  const visit = (node, prefix = '') => {
    if (!node.left && !node.right) {
      codeMap.set(node.symbol, prefix || '0')
      return
    }

    visit(node.left, `${prefix}0`)
    visit(node.right, `${prefix}1`)
  }

  visit(queue[0])
  return codeMap
}

export class ExtendedSourceAlgorithm extends BaseCompressionAlgorithm {
  constructor() {
    super(AlgorithmId.EXTENDED_SOURCE, 'Fuentes Extendidas')
  }

  async run(input) {
    this.validateInput(input)

    const start = performance.now()
    const order = Number(input.extensionOrder)

    if (!Number.isInteger(order) || order < 1 || order > 5) {
      throw new Error('El orden de la fuente extendida debe ser un entero entre 1 y 5.')
    }

    const sourceSymbols = resolveSymbols(input)
    const extendedSymbols = buildExtendedSymbols(sourceSymbols, order)
    const frequencyTable = buildFrequencyTable(extendedSymbols)
    const codeMap = buildHuffmanCodeMap(frequencyTable)
    const result = buildCompressionMetrics(input, frequencyTable, codeMap, start)
    const averageSymbolsPerBlock = sourceSymbols.length / extendedSymbols.length

    result.metrics.averageCodeLength = Number(
      (result.metrics.averageCodeLength / averageSymbolsPerBlock).toFixed(3),
    )
    result.metrics.entropy = Number(
      (result.metrics.entropy / averageSymbolsPerBlock).toFixed(3),
    )

    return this.createReadyResult(
      result.metrics,
      `Fuente extendida de orden ${order} con Huffman: ${sourceSymbols.length} símbolos agrupados en ${extendedSymbols.length} bloques, ${frequencyTable.length} bloques únicos y ${result.encodedBits} bits codificados frente a ${result.originalBits} bits originales.`,
    )
  }
}
