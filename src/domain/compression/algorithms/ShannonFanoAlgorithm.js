import { AlgorithmId } from '../CompressionAlgorithmContract'
import { BaseCompressionAlgorithm } from '../BaseCompressionAlgorithm'
import { buildCompressionMetrics, buildFrequencyTable, resolveSymbols } from './codingMetrics'

const findBalancedSplit = (symbols) => {
  const total = symbols.reduce((sum, { count }) => sum + count, 0)
  let leftTotal = 0
  let bestIndex = 1
  let bestDifference = Number.POSITIVE_INFINITY

  for (let index = 1; index < symbols.length; index += 1) {
    leftTotal += symbols[index - 1].count

    const rightTotal = total - leftTotal
    const difference = Math.abs(leftTotal - rightTotal)

    if (difference < bestDifference) {
      bestDifference = difference
      bestIndex = index
    }
  }

  return bestIndex
}

const assignShannonFanoCodes = (symbols, prefix = '', codeMap = new Map()) => {
  if (symbols.length === 1) {
    codeMap.set(symbols[0].symbol, prefix || '0')
    return codeMap
  }

  const splitIndex = findBalancedSplit(symbols)
  const leftGroup = symbols.slice(0, splitIndex)
  const rightGroup = symbols.slice(splitIndex)

  assignShannonFanoCodes(leftGroup, `${prefix}0`, codeMap)
  assignShannonFanoCodes(rightGroup, `${prefix}1`, codeMap)

  return codeMap
}

export class ShannonFanoAlgorithm extends BaseCompressionAlgorithm {
  constructor() {
    super(AlgorithmId.SHANNON_FANO, 'Shannon-Fano')
  }

  async run(input) {
    this.validateInput(input)

    const start = performance.now()
    const symbols = resolveSymbols(input)
    const frequencyTable = buildFrequencyTable(symbols)
    const sortedSymbols = [...frequencyTable].sort(
      (first, second) => second.count - first.count || first.index - second.index,
    )
    const codeMap = assignShannonFanoCodes(sortedSymbols)
    const { metrics, encodedBits, originalBits } = buildCompressionMetrics(
      input,
      frequencyTable,
      codeMap,
      start,
    )

    return this.createReadyResult(
      metrics,
      `Implementacion real de Shannon-Fano. ${symbols.length} simbolos procesados, ${frequencyTable.length} simbolos unicos, ${encodedBits} bits codificados frente a ${originalBits} bits originales.`,
    )
  }
}
