export const buildFrequencyTable = (text) => {
  const frequencyMap = new Map()

  for (const symbol of text) {
    frequencyMap.set(symbol, (frequencyMap.get(symbol) ?? 0) + 1)
  }

  return Array.from(frequencyMap.entries()).map(([symbol, count], index) => ({
    symbol,
    count,
    index,
  }))
}

export const calculateEntropy = (frequencyTable, totalSymbols) =>
  frequencyTable.reduce((entropy, { count }) => {
    const probability = count / totalSymbols
    return entropy - probability * Math.log2(probability)
  }, 0)

export const calculateAverageCodeLength = (frequencyTable, totalSymbols, codeMap) =>
  frequencyTable.reduce((averageLength, { symbol, count }) => {
    const codeLength = codeMap.get(symbol)?.length ?? 0
    return averageLength + (count / totalSymbols) * codeLength
  }, 0)

export const calculateEncodedBits = (frequencyTable, codeMap) =>
  frequencyTable.reduce((encodedBits, { symbol, count }) => {
    const codeLength = codeMap.get(symbol)?.length ?? 0
    return encodedBits + count * codeLength
  }, 0)

export const calculateOriginalBits = (text) => new TextEncoder().encode(text).length * 8

export const roundMetric = (value) => Number(value.toFixed(3))

export const buildCompressionMetrics = (text, frequencyTable, codeMap, startTime) => {
  const totalSymbols = frequencyTable.reduce((sum, { count }) => sum + count, 0)
  const entropy = calculateEntropy(frequencyTable, totalSymbols)
  const averageCodeLength = calculateAverageCodeLength(frequencyTable, totalSymbols, codeMap)
  const encodedBits = calculateEncodedBits(frequencyTable, codeMap)
  const originalBits = calculateOriginalBits(text)
  const compressionRatio = originalBits / encodedBits
  const executionTimeMs = Math.max(performance.now() - startTime, 0.001)

  return {
    metrics: {
      compressionRatio: roundMetric(compressionRatio),
      averageCodeLength: roundMetric(averageCodeLength),
      executionTimeMs: roundMetric(executionTimeMs),
      entropy: roundMetric(entropy),
    },
    encodedBits,
    originalBits,
  }
}
