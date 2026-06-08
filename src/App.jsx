import { useMemo, useState } from 'react'
import './App.css'
import { compressionAlgorithms } from './domain/compression/algorithms'
import { CompressionComparatorService } from './domain/compression/CompressionComparatorService'
import { AlgorithmStatus } from './domain/compression/CompressionAlgorithmContract'

const SAMPLE_TEXT =
  'La teoría de la información permite modelar la incertidumbre de una fuente y analizar la eficiencia de diferentes esquemas de codificación sobre un mismo corpus.'

const comparatorService = new CompressionComparatorService(compressionAlgorithms)

const formatMetric = (value, digits = 3) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'N/A'
  }

  return value.toFixed(digits)
}

function App() {
  const [textInput, setTextInput] = useState(SAMPLE_TEXT)
  const [extensionOrder, setExtensionOrder] = useState(2)
  const [results, setResults] = useState([])
  const [resultsVersion, setResultsVersion] = useState(0)
  const [statusMessage, setStatusMessage] = useState('Configura el texto y ejecuta la simulación.')
  const [isRunning, setIsRunning] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const textStats = useMemo(() => {
    const normalized = textInput.trim()
    return {
      characters: normalized.length,
      words: normalized ? normalized.split(/\s+/).length : 0,
      symbols: new Set(normalized).size,
    }
  }, [textInput])

  const handleSimulation = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (!textInput.trim()) {
      setErrorMessage('Debes ingresar un texto antes de ejecutar la simulación.')
      setStatusMessage('No se pudo ejecutar la simulación.')
      return
    }

    setIsRunning(true)
    setStatusMessage('Ejecutando simulación…')

    try {
      const nextResults = await comparatorService.compare(textInput, Number(extensionOrder))
      setResults(nextResults)
      setResultsVersion((previous) => previous + 1)
      setStatusMessage('Simulación completada correctamente.')
    } catch (error) {
      setErrorMessage(error.message ?? 'Ocurrió un error durante la simulación.')
      setStatusMessage('No se pudo completar la simulación.')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Saltar al contenido principal
      </a>
      <header className="page-header">
        <p className="project-tag">Proyecto del Curso</p>
        <h1>Simulador Comparativo de Algoritmos de Compresión de Texto</h1>
        <p className="project-description">
          Plataforma interactiva para comparar rendimiento de algoritmos de compresión sobre un
          mismo corpus y contrastar resultados empíricos con la teoría de la información.
        </p>
        <p className="project-members">
          <span>Integrantes:</span> Sebastian Alarcon, Manuel Navas, Cristian Cubillos
        </p>
      </header>

      <main id="main-content" className="layout">
        <section className="panel" aria-labelledby="input-title">
          <h2 id="input-title">Entrada del Corpus</h2>
          <form className="input-form" onSubmit={handleSimulation}>
            <label htmlFor="text-input">Texto a Comprimir</label>
            <textarea
              id="text-input"
              name="textInput"
              autoComplete="off"
              value={textInput}
              onChange={(event) => setTextInput(event.target.value)}
              placeholder="Ingresa o pega un texto real para analizar…"
              rows={8}
            />

            <div className="field-group">
              <label htmlFor="extension-order">Orden de Fuente Extendida</label>
              <input
                id="extension-order"
                name="extensionOrder"
                type="number"
                inputMode="numeric"
                min={1}
                max={5}
                value={extensionOrder}
                onChange={(event) => setExtensionOrder(event.target.value)}
              />
            </div>

            <div className="quick-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setTextInput(SAMPLE_TEXT)
                  setStatusMessage('Texto base cargado correctamente.')
                  setErrorMessage('')
                }}
              >
                Cargar Texto Base
              </button>
              <button type="submit" className="primary-button" disabled={isRunning}>
                {isRunning ? 'Ejecutando…' : 'Ejecutar Comparación'}
              </button>
            </div>
          </form>

          {errorMessage ? (
            <p className="error-message" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <p className="live-status" aria-live="polite">
            {statusMessage}
          </p>

          <ul className="stats-list">
            <li>
              <span>Caracteres</span>
              <strong>{textStats.characters}</strong>
            </li>
            <li>
              <span>Palabras</span>
              <strong>{textStats.words}</strong>
            </li>
            <li>
              <span>Símbolos Únicos</span>
              <strong>{textStats.symbols}</strong>
            </li>
          </ul>
        </section>

        <section className="panel" aria-labelledby="results-title">
          <h2 id="results-title">Resultados Comparativos</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Algoritmo</th>
                  <th>Estado</th>
                  <th>Ratio</th>
                  <th>Longitud Promedio</th>
                  <th>Entropía</th>
                  <th>Tiempo (ms)</th>
                </tr>
              </thead>
              <tbody>
                {results.length > 0 ? (
                  results.map((result, index) => (
                    <tr
                      key={`${resultsVersion}-${result.id}`}
                      className="result-row"
                      style={{ '--stagger': `${index * 90}ms` }}
                    >
                      <td>{result.name}</td>
                      <td>
                        <span
                          className={
                            result.status === AlgorithmStatus.READY
                              ? 'badge-ready result-badge'
                              : 'badge-pending result-badge'
                          }
                        >
                          {result.status === AlgorithmStatus.READY ? 'Disponible' : 'Pendiente'}
                        </span>
                      </td>
                      <td>{formatMetric(result.metrics?.compressionRatio)}</td>
                      <td>{formatMetric(result.metrics?.averageCodeLength)}</td>
                      <td>{formatMetric(result.metrics?.entropy)}</td>
                      <td>{formatMetric(result.metrics?.executionTimeMs, 2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="empty-table">
                      Ejecuta la comparación para visualizar métricas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="notes-list">
            {results.map((result) => (
              <article
                key={`${resultsVersion}-${result.id}-note`}
                className="note-card result-note"
              >
                <h3>{result.name}</h3>
                <p>{result.note}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

export default App
