export class CompressionComparatorService {
  constructor(algorithms) {
    this.algorithms = algorithms
  }

  async compare(text, extensionOrder) {
    const input = { text, extensionOrder }
    const executions = this.algorithms.map((algorithm) => algorithm.run(input))
    return Promise.all(executions)
  }
}
