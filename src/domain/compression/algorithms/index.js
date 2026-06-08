import { ExtendedSourceAlgorithm } from './ExtendedSourceAlgorithm'
import { HuffmanMockAlgorithm } from './HuffmanMockAlgorithm'
import { OptimalCodeAlgorithm } from './OptimalCodeAlgorithm'
import { ShannonFanoAlgorithm } from './ShannonFanoAlgorithm'

export const compressionAlgorithms = Object.freeze([
  new HuffmanMockAlgorithm(),
  new ShannonFanoAlgorithm(),
  new OptimalCodeAlgorithm(),
  new ExtendedSourceAlgorithm(),
])
