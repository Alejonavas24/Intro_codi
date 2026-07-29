import { useEffect, useMemo, useState } from 'react'
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
const MAX_PIXEL_COUNT = 16_000_000
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

const findBestCompressionResult = (results) =>
  [...results]
    .filter(
      (result) =>
        result.status === AlgorithmStatus.READY &&
        result.id !== 'hamming' &&
        Number.isFinite(result.metrics?.compressionRatio),
    )
    .sort(
      (first, second) =>
        second.metrics.compressionRatio - first.metrics.compressionRatio ||
        first.metrics.executionTimeMs - second.metrics.executionTimeMs,
    )[0] ?? null

function ResultsPanel({ results, resultsVersion, titleId }) {
  const bestCompressionResult = findBestCompressionResult(results)

  return (
    <section className="panel" aria-labelledby={titleId}>
      <h2 id={titleId}>Resultados Comparativos</h2>
      {bestCompressionResult ? (
        <div className="winner-card" role="status">
          <span>
            {bestCompressionResult.metrics.compressionRatio > 1
              ? 'Mejor compresión'
              : 'Menor expansión'}
          </span>
          <strong>{bestCompressionResult.name}</strong>
          <p>
            Ratio {formatMetric(bestCompressionResult.metrics.compressionRatio)} · Tamaño codificado{' '}
            {formatBytes(bestCompressionResult.metrics.compressedSizeBytes)}
          </p>
        </div>
      ) : null}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Algoritmo</th>
              <th>Estado</th>
              <th>Ratio</th>
              <th>Tamaño Codificado</th>
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
                  <td>
                    {result.name}
                    {result.id === bestCompressionResult?.id ? (
                      <span className="best-label">Mejor</span>
                    ) : null}
                  </td>
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
                  <td>
                    {result.metrics?.compressedSizeBytes != null
                      ? formatBytes(result.metrics.compressedSizeBytes)
                      : 'N/A'}
                  </td>
                  <td>{formatMetric(result.metrics?.averageCodeLength)}</td>
                  <td>{formatMetric(result.metrics?.entropy)}</td>
                  <td>{formatMetric(result.metrics?.executionTimeMs, 2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="empty-table">
                  Ejecuta la comparación para visualizar métricas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="notes-list">
        {results.map((result) => (
          <article key={`${resultsVersion}-${result.id}-note`} className="note-card result-note">
            <h3>{result.name}</h3>
            <p>{result.note}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState('signals')
  const [signalText, setSignalText] = useState(SAMPLE_TEXT)
  const [signalBytes, setSignalBytes] = useState(null)
  const [sourceMetadata, setSourceMetadata] = useState(createManualMetadata)
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null)
  const [inputMode, setInputMode] = useState(SignalInputMode.CHARACTERS)
  const [extensionOrder, setExtensionOrder] = useState(2)
  const [results, setResults] = useState([])
  const [resultsVersion, setResultsVersion] = useState(0)
  const [statusMessage, setStatusMessage] = useState('Configura la señal y ejecuta la simulación.')
  const [isRunning, setIsRunning] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [pixelBytes, setPixelBytes] = useState(null)
  const [pixelMetadata, setPixelMetadata] = useState(null)
  const [pixelPreviewUrl, setPixelPreviewUrl] = useState(null)
  const [pixelExtensionOrder, setPixelExtensionOrder] = useState(2)
  const [pixelResults, setPixelResults] = useState([])
  const [pixelResultsVersion, setPixelResultsVersion] = useState(0)
  const [pixelStatus, setPixelStatus] = useState('Carga una imagen para extraer sus píxeles.')
  const [pixelError, setPixelError] = useState('')
  const [isPixelRunning, setIsPixelRunning] = useState(false)

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

  useEffect(
    () => () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    },
    [imagePreviewUrl],
  )

  useEffect(
    () => () => {
      if (pixelPreviewUrl) {
        URL.revokeObjectURL(pixelPreviewUrl)
      }
    },
    [pixelPreviewUrl],
  )

  const handleTextChange = (event) => {
    const nextText = event.target.value

    setSignalText(nextText)
    setSignalBytes(null)
    setSourceMetadata(createManualMetadata())
    setImagePreviewUrl(null)
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
      const isImage = file.type.startsWith('image/')

      setSignalText(detectedMode === SignalInputMode.BYTES ? '' : decodedText)
      setSignalBytes(bytes)
      setInputMode(detectedMode)
      setImagePreviewUrl(isImage ? URL.createObjectURL(file) : null)
      setSourceMetadata({
        sourceType: 'file',
        name: file.name,
        mimeType: file.type || 'No especificado',
        size: file.size,
      })
      setResults([])
      setErrorMessage('')
      setStatusMessage(
        `Archivo "${file.name}" cargado como ${SIGNAL_INPUT_MODE_LABELS[detectedMode]}.`,
      )
    } catch (error) {
      setErrorMessage(error.message ?? 'No se pudo leer el archivo seleccionado.')
      setStatusMessage('No se pudo cargar el archivo.')
    }
  }

  const handleLoadSample = () => {
    setSignalText(SAMPLE_TEXT)
    setSignalBytes(null)
    setSourceMetadata(createManualMetadata())
    setImagePreviewUrl(null)
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
      setErrorMessage(error.message ?? 'La señal no se pudo interpretar.')
      setStatusMessage('No se pudo ejecutar la simulación.')
      return
    }

    setIsRunning(true)
    setStatusMessage('Ejecutando simulación...')

    try {
      const nextResults = await comparatorService.compare(signalInput, Number(extensionOrder))
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

  const handlePixelFileChange = async (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setPixelError('')
    setPixelStatus('Decodificando la imagen y extrayendo canales RGBA...')

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Selecciona un archivo de imagen válido.')
      }

      const bitmap = await createImageBitmap(file)
      const pixelCount = bitmap.width * bitmap.height

      if (pixelCount > MAX_PIXEL_COUNT) {
        bitmap.close()
        throw new Error('La imagen supera el límite de 16 millones de píxeles.')
      }

      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const context = canvas.getContext('2d', { willReadFrequently: true })

      if (!context) {
        bitmap.close()
        throw new Error('El navegador no pudo preparar el lienzo para leer los píxeles.')
      }

      context.drawImage(bitmap, 0, 0)
      const rgbaBytes = new Uint8Array(
        context.getImageData(0, 0, bitmap.width, bitmap.height).data,
      )
      const metadata = {
        sourceType: 'image-pixels',
        name: file.name,
        mimeType: file.type,
        size: rgbaBytes.byteLength,
        originalFileSize: file.size,
        width: bitmap.width,
        height: bitmap.height,
        pixelCount,
        channels: 4,
      }

      bitmap.close()
      setPixelBytes(rgbaBytes)
      setPixelMetadata(metadata)
      setPixelPreviewUrl(URL.createObjectURL(file))
      setPixelResults([])
      setPixelStatus(
        `${file.name}: ${metadata.width} × ${metadata.height} píxeles extraídos en RGBA.`,
      )
    } catch (error) {
      setPixelBytes(null)
      setPixelMetadata(null)
      setPixelPreviewUrl(null)
      setPixelResults([])
      setPixelError(error.message ?? 'No se pudieron extraer los píxeles de la imagen.')
      setPixelStatus('No se pudo procesar la imagen.')
    }
  }

  const handlePixelSimulation = async (event) => {
    event.preventDefault()
    setPixelError('')

    if (!pixelBytes || !pixelMetadata) {
      setPixelError('Primero debes cargar una imagen para extraer sus píxeles.')
      return
    }

    const pixelInput = normalizeSignalInput({
      text: '',
      bytes: pixelBytes,
      mode: SignalInputMode.BYTES,
      sourceMetadata: {
        ...pixelMetadata,
        modeLabel: 'Píxeles RGBA',
      },
    })

    setIsPixelRunning(true)
    setPixelStatus('Comparando los bytes RGBA con todos los algoritmos...')

    try {
      const nextResults = await comparatorService.compare(
        pixelInput,
        Number(pixelExtensionOrder),
      )
      setPixelResults(nextResults)
      setPixelResultsVersion((previous) => previous + 1)
      setPixelStatus('Comparación de píxeles completada correctamente.')
    } catch (error) {
      setPixelError(error.message ?? 'Ocurrió un error durante la comparación de píxeles.')
      setPixelStatus('No se pudo completar la comparación.')
    } finally {
      setIsPixelRunning(false)
    }
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Saltar al contenido principal
      </a>
      <header className="page-header">
        <p className="project-tag">Proyecto del Curso</p>
        <h1>Simulador Comparativo de Algoritmos de Compresión de Señales</h1>
        <p className="project-description">
          Compara archivos codificados o los píxeles RGBA reales de una imagen con los mismos
          algoritmos y métricas.
        </p>
        <p className="project-members">
          <span>Integrantes:</span> Sebastian Alarcon, Manuel Navas, Cristian Cubillos
        </p>
      </header>

      <main id="main-content">
        <div className="workspace-tabs" role="tablist" aria-label="Tipo de comparación">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'signals'}
            aria-controls="signals-panel"
            className={activeTab === 'signals' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('signals')}
          >
            Archivos y señales
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'pixels'}
            aria-controls="pixels-panel"
            className={activeTab === 'pixels' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('pixels')}
          >
            Comparación por píxeles
          </button>
        </div>

        {activeTab === 'signals' ? (
          <div id="signals-panel" role="tabpanel" className="layout">
            <section className="panel" aria-labelledby="input-title">
              <h2 id="input-title">Entrada de la Señal</h2>
              <form className="input-form" onSubmit={handleSimulation}>
                <label htmlFor="file-input">Cargar Archivo o Documento</label>
                <input
                  id="file-input"
                  name="fileInput"
                  type="file"
                  accept="image/*,.txt,.csv,.json,.md,application/octet-stream"
                  onChange={handleFileChange}
                  aria-describedby="file-help"
                />
                <p id="file-help" className="field-help">
                  En esta pestaña las imágenes se comparan como archivos codificados PNG, JPEG,
                  etc.
                </p>

                {imagePreviewUrl ? (
                  <figure className="image-preview">
                    <img src={imagePreviewUrl} alt={`Vista previa de ${sourceMetadata.name}`} />
                    <figcaption>La comparación usará los bytes del archivo.</figcaption>
                  </figure>
                ) : null}

                <label htmlFor="text-input">Contenido de la Señal</label>
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
                    <label htmlFor="input-mode">Interpretación</label>
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
                    {isRunning ? 'Ejecutando...' : 'Ejecutar Comparación'}
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
                  <span>Tamaño</span>
                  <strong>
                    {signalStats.size != null ? formatBytes(signalStats.size) : 'Manual'}
                  </strong>
                </li>
                <li>
                  <span>Modo</span>
                  <strong>{signalStats.modeLabel}</strong>
                </li>
                <li>
                  <span>Símbolos</span>
                  <strong>{signalStats.totalSymbols}</strong>
                </li>
                <li>
                  <span>Únicos</span>
                  <strong>{signalStats.uniqueSymbols}</strong>
                </li>
              </ul>
            </section>

            <ResultsPanel
              results={results}
              resultsVersion={resultsVersion}
              titleId="signal-results-title"
            />
          </div>
        ) : (
          <div id="pixels-panel" role="tabpanel" className="layout">
            <section className="panel" aria-labelledby="pixel-input-title">
              <h2 id="pixel-input-title">Píxeles Reales de la Imagen</h2>
              <form className="input-form" onSubmit={handlePixelSimulation}>
                <label htmlFor="pixel-file-input">Cargar Imagen</label>
                <input
                  id="pixel-file-input"
                  name="pixelFileInput"
                  type="file"
                  accept="image/*"
                  onChange={handlePixelFileChange}
                  aria-describedby="pixel-file-help"
                />
                <p id="pixel-file-help" className="field-help">
                  Canvas decodifica cada píxel como rojo, verde, azul y alfa: 32 bits por píxel.
                </p>

                {pixelPreviewUrl ? (
                  <figure className="image-preview pixel-preview">
                    <img src={pixelPreviewUrl} alt={`Píxeles de ${pixelMetadata?.name}`} />
                    <figcaption>
                      Se compararán {pixelMetadata?.pixelCount.toLocaleString()} píxeles en RGBA.
                    </figcaption>
                  </figure>
                ) : (
                  <div className="pixel-placeholder">
                    <span>RGBA</span>
                    <p>Selecciona una imagen para extraer sus canales de color.</p>
                  </div>
                )}

                <div className="field-group">
                  <label htmlFor="pixel-extension-order">Orden de Fuente Extendida</label>
                  <input
                    id="pixel-extension-order"
                    name="pixelExtensionOrder"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={5}
                    value={pixelExtensionOrder}
                    onChange={(event) => setPixelExtensionOrder(event.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={isPixelRunning || !pixelBytes}
                >
                  {isPixelRunning ? 'Comparando píxeles...' : 'Comparar Píxeles'}
                </button>
              </form>

              {pixelError ? (
                <p className="error-message" role="alert">
                  {pixelError}
                </p>
              ) : null}
              <p className="live-status" aria-live="polite">
                {pixelStatus}
              </p>

              <ul className="stats-list pixel-stats">
                <li>
                  <span>Dimensiones</span>
                  <strong>
                    {pixelMetadata
                      ? `${pixelMetadata.width} × ${pixelMetadata.height}`
                      : 'Sin imagen'}
                  </strong>
                </li>
                <li>
                  <span>Píxeles</span>
                  <strong>{pixelMetadata?.pixelCount.toLocaleString() ?? '0'}</strong>
                </li>
                <li>
                  <span>Canales</span>
                  <strong>{pixelMetadata ? '4 (RGBA)' : '—'}</strong>
                </li>
                <li>
                  <span>Bits por píxel</span>
                  <strong>{pixelMetadata ? '32 bits' : '—'}</strong>
                </li>
                <li>
                  <span>Archivo original</span>
                  <strong>{formatBytes(pixelMetadata?.originalFileSize)}</strong>
                </li>
                <li>
                  <span>Datos RGBA</span>
                  <strong>{formatBytes(pixelMetadata?.size)}</strong>
                </li>
              </ul>
            </section>

            <ResultsPanel
              results={pixelResults}
              resultsVersion={pixelResultsVersion}
              titleId="pixel-results-title"
            />
          </div>
        )}
      </main>
    </>
  )
}

export default App
