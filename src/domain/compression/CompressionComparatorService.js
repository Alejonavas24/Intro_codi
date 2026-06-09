export class CompressionComparatorService {
  constructor(algorithms) {
    this.algorithms = algorithms
  }

  async compare(signalInput, extensionOrder) {
    const input =
      typeof signalInput === 'string'
        ? { text: signalInput, extensionOrder }
        : { ...signalInput, extensionOrder }
    const executions = this.algorithms.map((algorithm) => algorithm.run(input))
    return Promise.all(executions)
  }
}
