import { useMemo, useState } from 'react'
import './App.css'
import { compressionAlgorithms } from './domain/compression/algorithms'
import { CompressionComparatorService } from './domain/compression/CompressionComparatorService'
import { AlgorithmStatus } from './domain/compression/CompressionAlgorithmContract'
import {
  detectSignalInputMode,
  normalizeSignalInput,
  SIGNAL_INPUT_MODE_LABELS,
  SignalInputMode,
} from './domain/compression/InputSignalNormalizer'

const SAMPLE_TEXT =
  'La teoria de la informacion permite modelar la incertidumbre de una fuente y analizar la eficiencia de diferentes esquemas de codificacion sobre un mismo corpus.'

const comparatorService = new CompressionComparatorService(compressionAlgorithms)

const formatMetric = (value, digits = 3) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'N/A'
  }

  return value.toFixed(digits)
}

const formatBytes = (bytes) => {
  if (!bytes) {
    return '0 B'
  }

  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const createManualMetadata = () => ({
  sourceType: 'manual',
  name: 'Entrada manual',
  mimeType: 'text/plain',
  size: null,
})

function App() {
  const [signalText, setSignalText] = useState(SAMPLE_TEXT)
  const [signalBytes, setSignalBytes] = useState(null)
  const [sourceMetadata, setSourceMetadata] = useState(createManualMetadata)
  const [inputMode, setInputMode] = useState(SignalInputMode.CHARACTERS)
  const [extensionOrder, setExtensionOrder] = useState(2)
  const [results, setResults] = useState([])
  const [resultsVersion, setResultsVersion] = useState(0)
  const [statusMessage, setStatusMessage] = useState('Configura la senal y ejecuta la simulacion.')
  const [isRunning, setIsRunning] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const normalizedSignal = useMemo(() => {
    try {
      return normalizeSignalInput({
        text: signalText,
        bytes: signalBytes,
        mode: inputMode,
        sourceMetadata,
      })
    } catch {
      return null
    }
  }, [inputMode, signalBytes, signalText, sourceMetadata])

  const signalStats = normalizedSignal?.sourceMetadata ?? {
    totalSymbols: 0,
    uniqueSymbols: 0,
    mode: inputMode,
    modeLabel: SIGNAL_INPUT_MODE_LABELS[inputMode],
    sourceType: sourceMetadata.sourceType,
    name: sourceMetadata.name,
    mimeType: sourceMetadata.mimeType,
    size: sourceMetadata.size,
  }

  const handleTextChange = (event) => {
    const nextText = event.target.value

    setSignalText(nextText)
    setSignalBytes(null)
    setSourceMetadata(createManualMetadata())
    setInputMode(detectSignalInputMode({ text: nextText }))
    setResults([])
    setErrorMessage('')
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const arrayBuffer = await file.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      const decodedText = new TextDecoder().decode(bytes)
      const detectedMode = detectSignalInputMode({ file, text: decodedText })

      setSignalText(decodedText)
      setSignalBytes(bytes)
      setInputMode(detectedMode)
      setSourceMetadata({
        sourceType: 'file',
        name: file.name,
        mimeType: file.type || 'No especificado',
        size: file.size,
      })
      setResults([])
      setErrorMessage('')
      setStatusMessage(`Archivo "${file.name}" cargado como ${SIGNAL_INPUT_MODE_LABELS[detectedMode]}.`)
    } catch (error) {
      setErrorMessage(error.message ?? 'No se pudo leer el archivo seleccionado.')
      setStatusMessage('No se pudo cargar el archivo.')
    }
  }

  const handleLoadSample = () => {
    setSignalText(SAMPLE_TEXT)
    setSignalBytes(null)
    setSourceMetadata(createManualMetadata())
    setInputMode(SignalInputMode.CHARACTERS)
    setResults([])
    setStatusMessage('Texto base cargado correctamente.')
    setErrorMessage('')
  }

  const handleSimulation = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    let signalInput
    try {
      signalInput = normalizeSignalInput({
        text: signalText,
        bytes: signalBytes,
        mode: inputMode,
        sourceMetadata,
      })
    } catch (error) {
      setErrorMessage(error.message ?? 'La senal no se pudo interpretar.')
      setStatusMessage('No se pudo ejecutar la simulacion.')
      return
    }

    setIsRunning(true)
    setStatusMessage('Ejecutando simulacion...')

    try {
      const nextResults = await comparatorService.compare(signalInput, Number(extensionOrder))
      setResults(nextResults)
      setResultsVersion((previous) => previous + 1)
      setStatusMessage('Simulacion completada correctamente.')
    } catch (error) {
      setErrorMessage(error.message ?? 'Ocurrio un error durante la simulacion.')
      setStatusMessage('No se pudo completar la simulacion.')
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
        <h1>Simulador Comparativo de Algoritmos de Compresion de Senales</h1>
        <p className="project-description">
          Plataforma interactiva para cargar una fuente discreta, comprimirla con varios codigos y
          comparar sus metricas sobre la misma senal.
        </p>
        <p className="project-members">
          <span>Integrantes:</span> Sebastian Alarcon, Manuel Navas, Cristian Cubillos
        </p>
      </header>

      <main id="main-content" className="layout">
        <section className="panel" aria-labelledby="input-title">
          <h2 id="input-title">Entrada de la Senal</h2>
          <form className="input-form" onSubmit={handleSimulation}>
            <label htmlFor="file-input">Cargar Archivo o Documento</label>
            <input
              id="file-input"
              name="fileInput"
              type="file"
              onChange={handleFileChange}
              aria-describedby="file-help"
            />
            <p id="file-help" className="field-help">
              Soporta texto, CSV/tokens, bits y archivos interpretados como bytes.
            </p>

            <label htmlFor="text-input">Contenido de la Senal</label>
            <textarea
              id="text-input"
              name="textInput"
              autoComplete="off"
              value={signalText}
              onChange={handleTextChange}
              placeholder="Ingresa texto, bits o tokens como 12,15,12,14..."
              rows={8}
            />

            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="input-mode">Interpretacion</label>
                <select
                  id="input-mode"
                  name="inputMode"
                  value={inputMode}
                  onChange={(event) => {
                    setInputMode(event.target.value)
                    setErrorMessage('')
                  }}
                >
                  {Object.entries(SIGNAL_INPUT_MODE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

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
            </div>

            <div className="quick-actions">
              <button type="button" className="secondary-button" onClick={handleLoadSample}>
                Cargar Texto Base
              </button>
              <button type="submit" className="primary-button" disabled={isRunning}>
                {isRunning ? 'Ejecutando...' : 'Ejecutar Comparacion'}
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

          <ul className="stats-list signal-stats">
            <li>
              <span>Fuente</span>
              <strong>{signalStats.name}</strong>
            </li>
            <li>
              <span>Tipo</span>
              <strong>{signalStats.mimeType || 'No especificado'}</strong>
            </li>
            <li>
              <span>Tamano</span>
              <strong>{signalStats.size != null ? formatBytes(signalStats.size) : 'Manual'}</strong>
            </li>
            <li>
              <span>Modo</span>
              <strong>{signalStats.modeLabel}</strong>
            </li>
            <li>
              <span>Simbolos</span>
              <strong>{signalStats.totalSymbols}</strong>
            </li>
            <li>
              <span>Unicos</span>
              <strong>{signalStats.uniqueSymbols}</strong>
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
                  <th>Entropia</th>
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
                      Ejecuta la comparacion para visualizar metricas.
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
