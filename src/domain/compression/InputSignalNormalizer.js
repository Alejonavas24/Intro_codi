export const SignalInputMode = Object.freeze({
  CHARACTERS: 'characters',
  TOKENS: 'tokens',
  BITS: 'bits',
  BYTES: 'bytes',
})

export const SIGNAL_INPUT_MODE_LABELS = Object.freeze({
  [SignalInputMode.CHARACTERS]: 'Caracteres',
  [SignalInputMode.TOKENS]: 'Tokens',
  [SignalInputMode.BITS]: 'Bits',
  [SignalInputMode.BYTES]: 'Bytes',
})

const TEXT_EXTENSIONS = new Set(['txt', 'json', 'md'])
const TOKEN_EXTENSIONS = new Set(['csv'])
const TOKEN_SEPARATOR = /[\s,;]+/
const TOKEN_CLEANUP_SEPARATOR = /[\s,;]+/g
const BITS_PATTERN = /^[01\s,;]+$/

const getFileExtension = (fileName = '') => {
  const segments = fileName.toLowerCase().split('.')
  return segments.length > 1 ? segments.at(-1) : ''
}

const toUtf8BitLength = (text) => new TextEncoder().encode(text).length * 8

const toSymbolsFromText = (text) => Array.from(text)

const toSymbolsFromTokens = (text) =>
  text
    .trim()
    .split(TOKEN_SEPARATOR)
    .map((token) => token.trim())
    .filter(Boolean)

const toSymbolsFromBits = (text) => {
  const compactText = text.replace(TOKEN_CLEANUP_SEPARATOR, '')

  if (!compactText || !/^[01]+$/.test(compactText)) {
    throw new Error('La senal en modo bits solo puede contener 0 y 1.')
  }

  return Array.from(compactText)
}

const toSymbolsFromBytes = (bytes) => Array.from(bytes, (byte) => String(byte))

export const detectSignalInputMode = ({ file, text = '' }) => {
  const extension = getFileExtension(file?.name)
  const trimmedText = text.trim()

  if (TOKEN_EXTENSIONS.has(extension)) {
    return SignalInputMode.TOKENS
  }

  if (TEXT_EXTENSIONS.has(extension)) {
    return SignalInputMode.CHARACTERS
  }

  if (trimmedText && BITS_PATTERN.test(trimmedText)) {
    return SignalInputMode.BITS
  }

  return file ? SignalInputMode.BYTES : SignalInputMode.CHARACTERS
}

export const normalizeSignalInput = ({ text = '', bytes = null, mode, sourceMetadata = {} }) => {
  const selectedMode = mode ?? SignalInputMode.CHARACTERS
  const hasBytes = bytes instanceof Uint8Array
  let symbols
  let originalBitLength = toUtf8BitLength(text)

  if (selectedMode === SignalInputMode.BYTES) {
    if (!hasBytes) {
      throw new Error('No hay bytes disponibles para interpretar la senal como archivo binario.')
    }

    symbols = toSymbolsFromBytes(bytes)
    originalBitLength = bytes.byteLength * 8
  } else if (selectedMode === SignalInputMode.TOKENS) {
    symbols = toSymbolsFromTokens(text)
  } else if (selectedMode === SignalInputMode.BITS) {
    symbols = toSymbolsFromBits(text)
    originalBitLength = symbols.length
  } else {
    symbols = toSymbolsFromText(text)
  }

  if (symbols.length === 0) {
    throw new Error('Debes ingresar o cargar una senal con al menos un simbolo.')
  }

  return {
    symbols,
    originalBitLength,
    sourceText: text,
    sourceMetadata: {
      ...sourceMetadata,
      mode: selectedMode,
      modeLabel: SIGNAL_INPUT_MODE_LABELS[selectedMode],
      totalSymbols: symbols.length,
      uniqueSymbols: new Set(symbols).size,
    },
  }
}
