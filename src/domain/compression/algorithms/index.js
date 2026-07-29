import { DeflateAlgorithm } from './DeflateAlgorithm'
import { ExtendedSourceAlgorithm } from './ExtendedSourceAlgorithm'
import { HammingAlgorithm } from './HammingAlgorithm'
import { HuffmanMockAlgorithm } from './HuffmanMockAlgorithm'
import { LzwAlgorithm } from './LzwAlgorithm'
import { RleAlgorithm } from './RleAlgorithm'
import { ShannonFanoAlgorithm } from './ShannonFanoAlgorithm'

export const compressionAlgorithms = Object.freeze([
  new HuffmanMockAlgorithm(),
  new ShannonFanoAlgorithm(),
  new RleAlgorithm(),
  new LzwAlgorithm(),
  new DeflateAlgorithm(),
  new HammingAlgorithm(),
  new ExtendedSourceAlgorithm(),
])
