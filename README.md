# Simulador Comparativo de Algoritmos de Compresion de Texto

SPA desarrollada con React + Vite para comparar algoritmos de compresion sobre un mismo corpus de texto.

## Integrantes

- Sebastian Alarcon
- Manuel Navas
- Cristian Cubillos

## Objetivo del proyecto

La aplicacion permite ingresar un texto y ejecutar una comparacion entre distintos algoritmos de compresion.  
Actualmente la arquitectura deja definidos los contratos para todos los algoritmos y una implementacion mock funcional para Huffman.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Como correr el proyecto

1. Instalar dependencias:
   - `npm install`
2. Iniciar en modo desarrollo:
   - `npm run dev`
3. Abrir la URL que muestra Vite en consola (por defecto `http://localhost:5173`).

## Scripts disponibles

- `npm run dev`: inicia servidor de desarrollo.
- `npm run build`: genera build de produccion.
- `npm run preview`: sirve el build generado localmente.
- `npm run lint`: valida reglas de calidad con ESLint.

## Estructura base

- `src/App.jsx`: interfaz principal de la SPA.
- `src/App.css` y `src/index.css`: estilos y layout.
- `src/domain/compression/CompressionAlgorithmContract.js`: contratos y tipos base.
- `src/domain/compression/BaseCompressionAlgorithm.js`: comportamiento comun para algoritmos.
- `src/domain/compression/CompressionComparatorService.js`: servicio orquestador de comparaciones.
- `src/domain/compression/algorithms/`: implementaciones concretas por algoritmo.

## Como colaborar

1. Crear una rama para tu cambio.
2. Hacer cambios pequenos y enfocados.
3. Antes de compartir, ejecutar:
   - `npm run lint`
   - `npm run build`
4. Abrir PR con descripcion clara de:
   - problema u objetivo
   - cambios realizados
   - forma de validacion

## Convenciones del proyecto

- Mantener separacion por capas: UI, servicio y dominio.
- Reutilizar contratos existentes antes de crear nuevas estructuras.
- Aplicar principios SOLID en nuevas implementaciones.
- No duplicar funcionalidades ni crear archivos paralelos innecesarios.
- Mantener consistencia de nombres, estilo y estructura.

## Extender con nuevos algoritmos

Para agregar una implementacion real:

1. Crear clase en `src/domain/compression/algorithms/` extendiendo `BaseCompressionAlgorithm`.
2. Implementar `run(input)` devolviendo resultado con el formato del contrato.
3. Registrar la instancia en `src/domain/compression/algorithms/index.js`.
4. Validar que la UI refleje correctamente estado, metricas y notas.