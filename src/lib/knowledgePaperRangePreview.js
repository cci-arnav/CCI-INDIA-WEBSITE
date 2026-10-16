import { createCanvas } from '@napi-rs/canvas'
import { PDFDataRangeTransport, getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
// Ensure Vercel's function file tracer includes PDF.js's Node fake-worker
// module. PDF.js otherwise loads this worker through a runtime-computed import
// path, which can be omitted from a serverless function bundle.
import 'pdfjs-dist/legacy/build/pdf.worker.mjs'
import { PDFDocument } from 'pdf-lib'
import { KNOWLEDGE_PAPER_PREVIEW_PAGE_LIMIT } from './knowledgePaperPreviewLimits.js'

export const PREVIEW_PAGE_LIMIT = KNOWLEDGE_PAPER_PREVIEW_PAGE_LIMIT
export const RANGE_CHUNK_BYTES = 1024 * 1024
export const RANGE_REQUEST_TIMEOUT_MS = 15_000
export const PREVIEW_TOTAL_TIMEOUT_MS = 45_000
export const PREVIEW_TRANSFER_BUDGET_BYTES = 24 * 1024 * 1024
const MAX_PDFJS_RANGE_BYTES = PREVIEW_TRANSFER_BUDGET_BYTES
const STORAGE_RANGE_BYTES = RANGE_CHUNK_BYTES
const MAX_PAGE_PIXELS = 4_000_000

export class PrivatePdfRangeError extends Error {
  constructor(code, stage = 'preview_pipeline', cause = null, status = null) {
    super(code)
    this.name = 'PrivatePdfRangeError'
    this.code = code
    this.stage = stage
    this.upstreamErrorName = /^[A-Za-z][A-Za-z0-9]{0,63}$/.test(cause?.name || '') ? cause.name : null
    this.upstreamCode = /^[A-Z0-9_]{1,64}$/.test(cause?.code || '') ? cause.code : null
    this.status = Number.isInteger(status) && status >= 100 && status <= 599 ? status : null
  }
}

export const getPreviewFailureDiagnostic = (failure, { supabaseUrl, serviceRoleKey } = {}) => {
  const stage = failure?.stage
  const errorClass = failure?.upstreamErrorName || failure?.name
  const errorCode = failure?.upstreamCode || failure?.code
  const status = failure?.status
  return {
    stage: /^[a-z][a-z0-9_]{0,63}$/.test(stage || '') ? stage : 'preview_pipeline',
    errorClass: /^[A-Za-z][A-Za-z0-9]{0,63}$/.test(errorClass || '') ? errorClass : 'Error',
    errorCode: /^[A-Z0-9_]{1,64}$/.test(errorCode || '') ? errorCode : null,
    status: Number.isInteger(status) && status >= 100 && status <= 599 ? status : null,
    hasSupabaseUrl: Boolean(supabaseUrl),
    hasServiceRoleKey: Boolean(serviceRoleKey),
  }
}

async function renderPreviewPages(
  pdf,
  renderPage = async (page, canvas, viewport) => {
    await page.render({ canvas, canvasContext: canvas.getContext('2d'), viewport }).promise
  },
  getPage = (pageNumber) => pdf.getPage(pageNumber),
) {
  const deliveredPages = Math.min(PREVIEW_PAGE_LIMIT, pdf.numPages)
  if (deliveredPages < 1) throw new PrivatePdfRangeError('INVALID_PDF_SOURCE', 'pdfjs_parse')
  const output = await PDFDocument.create()
  for (let pageNumber = 1; pageNumber <= deliveredPages; pageNumber += 1) {
    let canvas
    try {
      const page = await getPage(pageNumber)
      const baseViewport = page.getViewport({ scale: 1 })
      const scale = Math.min(1.5, Math.sqrt(MAX_PAGE_PIXELS / (baseViewport.width * baseViewport.height)))
      const viewport = page.getViewport({ scale })
      canvas = createCanvas(Math.max(1, Math.ceil(viewport.width)), Math.max(1, Math.ceil(viewport.height)))
      await renderPage(page, canvas, viewport)
      const png = canvas.toBuffer('image/png')
      const image = await output.embedPng(png)
      const outputPage = output.addPage([viewport.width, viewport.height])
      outputPage.drawImage(image, { x: 0, y: 0, width: viewport.width, height: viewport.height })
    } catch (cause) {
      if (cause instanceof PrivatePdfRangeError) throw cause
      throw new PrivatePdfRangeError('PREVIEW_GENERATION_FAILED', 'page_render', cause)
    } finally {
      if (canvas) {
        canvas.width = 0
        canvas.height = 0
      }
    }
  }
  return { output, deliveredPages }
}

export async function createLocalPdfPreview(sourceBytes) {
  const bytes = Uint8Array.from(sourceBytes)
  if (new TextDecoder().decode(bytes.subarray(0, 5)) !== '%PDF-') {
    throw new PrivatePdfRangeError('INVALID_PDF_SOURCE', 'pdf_signature')
  }
  const loadingTask = getDocument({ data: bytes, useSystemFonts: true, stopAtErrors: true, verbosity: 0 })
  try {
    let pdf
    try {
      pdf = await loadingTask.promise
    } catch (cause) {
      throw new PrivatePdfRangeError('INVALID_PDF_SOURCE', 'pdfjs_parse', cause)
    }
    const { output, deliveredPages } = await renderPreviewPages(pdf)
    const previewBytes = Uint8Array.from(await output.save())
    return { bytes: previewBytes, pageCount: pdf.numPages, deliveredPages }
  } catch (cause) {
    if (cause instanceof PrivatePdfRangeError) throw cause
    throw new PrivatePdfRangeError('PREVIEW_GENERATION_FAILED', 'preview_serialization', cause)
  } finally {
    await loadingTask.destroy().catch(() => {})
  }
}

const makeObjectUrl = (supabaseUrl, bucket, storagePath) => {
  const base = new URL(supabaseUrl)
  const encodedPath = storagePath.split('/').map(encodeURIComponent).join('/')
  return new URL(`/storage/v1/object/authenticated/${encodeURIComponent(bucket)}/${encodedPath}`, base).toString()
}

const waitForResponseBytes = async (response, expectedLength, signal) => {
  const reader = response.body?.getReader()
  if (!reader) throw new PrivatePdfRangeError('PRIVATE_STORAGE_RANGE_INVALID', 'storage_range_body')
  const chunks = []
  let received = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      received += value.byteLength
      if (received > expectedLength) {
        await reader.cancel().catch(() => {})
        throw new PrivatePdfRangeError('PRIVATE_STORAGE_RANGE_INVALID', 'storage_range_body')
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  if (signal.aborted) throw new PrivatePdfRangeError('PRIVATE_STORAGE_TIMEOUT', 'storage_range_body')
  if (received !== expectedLength) throw new PrivatePdfRangeError('PRIVATE_STORAGE_RANGE_INVALID', 'storage_range_body')
  if (chunks.length === 1) return chunks[0]
  const bytes = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return bytes
}

class SupabasePdfRangeTransport extends PDFDataRangeTransport {
  constructor(length, initialData, fetchRange, fail, onRangeComplete) {
    super(length, initialData, false)
    this.fetchRange = fetchRange
    this.fail = fail
    this.onRangeComplete = onRangeComplete
    this.controllers = new Set()
  }

  requestDataRange(begin, end) {
    const controller = new AbortController()
    this.controllers.add(controller)
    this.fetchRange(begin, end, controller.signal)
      .then((chunk) => {
        this.onRangeComplete()
        this.onDataRange(begin, chunk)
      })
      .catch((error) => this.fail(error))
      .finally(() => this.controllers.delete(controller))
  }

  abort() {
    for (const controller of this.controllers) controller.abort()
    this.controllers.clear()
  }
}

/**
 * Reads PDF.js ranges from a private Supabase object and returns a newly
 * rendered PDF containing at most ten pages. The original is never assembled
 * into one buffer or returned to the caller.
 */
export async function createPrivatePdfPreview({ supabaseUrl, serviceRoleKey, bucket, storagePath, fetchImpl = fetch }) {
  let url
  try {
    url = makeObjectUrl(supabaseUrl, bucket, storagePath)
  } catch (cause) {
    throw new PrivatePdfRangeError('SUPABASE_CONFIGURATION_INVALID', 'storage_url', cause)
  }
  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Accept-Encoding': 'identity',
  }
  const requestControllers = new Set()
  let transferred = 0
  let rangeRequestCount = 0
  const timingsMs = { storage: 0, pdfjsParse: null, pageRender: null, serialization: null }
  const progress = { stage: 'storage_head_request', status: null, sourceSignatureValid: null, sourcePageCount: null, sourceSizeBytes: null }
  let failed = false
  let rejectFailure
  let loadingTask
  let timer
  const failurePromise = new Promise((_, reject) => { rejectFailure = reject })
  failurePromise.catch(() => {})
  const fail = (error) => {
    if (failed) return
    failed = true
    const safeError = error instanceof PrivatePdfRangeError ? error : new PrivatePdfRangeError('PRIVATE_STORAGE_UNAVAILABLE', 'pdfjs_range_transport', error)
    rejectFailure(safeError)
    for (const controller of requestControllers) controller.abort()
  }
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new PrivatePdfRangeError('PREVIEW_GENERATION_TIMEOUT', progress.stage, null, progress.status)
      error.sourceSignatureValid = progress.sourceSignatureValid
      error.sourcePageCount = progress.sourcePageCount
      error.sourceSizeBytes = progress.sourceSizeBytes
      error.transferredBytes = transferred
      error.rangeRequestCount = rangeRequestCount
      error.timingsMs = { ...timingsMs }
      fail(error)
      reject(error)
    }, PREVIEW_TOTAL_TIMEOUT_MS)
  })

  const operation = (async () => {
    const headController = new AbortController()
    requestControllers.add(headController)
    const headStarted = performance.now()
    let metadata
    try {
      metadata = await fetchImpl(url, {
        method: 'HEAD',
        headers,
        signal: AbortSignal.any([headController.signal, AbortSignal.timeout(RANGE_REQUEST_TIMEOUT_MS)]),
      })
    } catch (cause) {
      const timeout = cause?.name === 'AbortError' || cause?.name === 'TimeoutError'
      throw new PrivatePdfRangeError(timeout ? 'PRIVATE_STORAGE_TIMEOUT' : 'PRIVATE_STORAGE_UNAVAILABLE', 'storage_head_request', cause)
    } finally {
      timingsMs.storage += performance.now() - headStarted
      requestControllers.delete(headController)
    }
    if (!metadata.ok) {
      const code = metadata.status === 404 ? 'PRIVATE_OBJECT_MISSING' : metadata.status === 401 || metadata.status === 403 ? 'PRIVATE_STORAGE_ACCESS_DENIED' : 'PRIVATE_STORAGE_UNAVAILABLE'
      throw new PrivatePdfRangeError(code, 'storage_head_response', null, metadata.status)
    }
    if (!/^bytes$/i.test(metadata.headers.get('accept-ranges') || '')) throw new PrivatePdfRangeError('PRIVATE_STORAGE_RANGE_UNSUPPORTED', 'storage_head_headers', null, metadata.status)
    const length = Number(metadata.headers.get('content-length'))
    if (!Number.isSafeInteger(length) || length < 8) throw new PrivatePdfRangeError('PRIVATE_STORAGE_RANGE_INVALID', 'storage_head_headers', null, metadata.status)
    progress.sourceSizeBytes = length

    const rangeCache = new Map()
    const getRange = async (begin, end, parentSignal) => {
      const size = end - begin
      if (!Number.isSafeInteger(begin) || !Number.isSafeInteger(end) || begin < 0 || end > length || size < 1) {
        throw new PrivatePdfRangeError('PRIVATE_STORAGE_RANGE_INVALID', 'range_validation')
      }
      if (size > MAX_PDFJS_RANGE_BYTES) throw new PrivatePdfRangeError('PRIVATE_STORAGE_RANGE_TOO_LARGE', 'range_validation')
      const transferBudget = length <= RANGE_CHUNK_BYTES
        ? Math.min(PREVIEW_TRANSFER_BUDGET_BYTES, length + RANGE_CHUNK_BYTES)
        : Math.min(PREVIEW_TRANSFER_BUDGET_BYTES, length - 1)
      const chunks = []
      for (let chunkBegin = Math.floor(begin / STORAGE_RANGE_BYTES) * STORAGE_RANGE_BYTES; chunkBegin < end; chunkBegin += STORAGE_RANGE_BYTES) {
        const chunkEnd = Math.min(length, chunkBegin + STORAGE_RANGE_BYTES)
        const chunkSize = chunkEnd - chunkBegin
        const key = `${chunkBegin}:${chunkEnd}`
        let chunkPromise = rangeCache.get(key)
        if (!chunkPromise) {
          if (transferred + chunkSize > transferBudget) {
            throw new PrivatePdfRangeError('PREVIEW_RANGE_BUDGET_EXCEEDED', 'range_validation')
          }
          transferred += chunkSize
          rangeRequestCount += 1
          const controller = new AbortController()
          requestControllers.add(controller)
          const signal = AbortSignal.any([parentSignal, controller.signal, AbortSignal.timeout(RANGE_REQUEST_TIMEOUT_MS)])
          let stage = 'storage_range_request'
          let responseStatus = null
          const rangeStarted = performance.now()
          chunkPromise = (async () => {
            try {
              progress.stage = stage
              const response = await fetchImpl(url, {
                method: 'GET',
                headers: { ...headers, Range: `bytes=${chunkBegin}-${chunkEnd - 1}` },
                signal,
              })
              responseStatus = response.status
              progress.status = response.status
              const expectedRange = `bytes ${chunkBegin}-${chunkEnd - 1}/${length}`
              if (response.status !== 206) {
                await response.body?.cancel().catch(() => {})
                const code = response.status === 404 ? 'PRIVATE_OBJECT_MISSING' : response.status === 401 || response.status === 403 ? 'PRIVATE_STORAGE_ACCESS_DENIED' : 'PRIVATE_STORAGE_RANGE_RESPONSE_INVALID'
                throw new PrivatePdfRangeError(code, 'storage_range_response', null, response.status)
              }
              if (response.headers.get('content-range') !== expectedRange || Number(response.headers.get('content-length')) !== chunkSize || response.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() !== 'application/pdf') {
                await response.body?.cancel().catch(() => {})
                throw new PrivatePdfRangeError('PRIVATE_STORAGE_RANGE_RESPONSE_INVALID', 'storage_range_headers', null, response.status)
              }
              stage = 'storage_range_body'
              progress.stage = stage
              const chunk = await waitForResponseBytes(response, chunkSize, signal)
              if (chunkBegin === 0) {
                progress.sourceSignatureValid = new TextDecoder().decode(chunk.subarray(0, 5)) === '%PDF-'
                if (!progress.sourceSignatureValid) throw new PrivatePdfRangeError('INVALID_PDF_SOURCE', 'pdf_signature', null, response.status)
              }
              return chunk
            } catch (error) {
              if (error instanceof PrivatePdfRangeError) throw error
              if (error?.name === 'AbortError' || error?.name === 'TimeoutError') throw new PrivatePdfRangeError('PRIVATE_STORAGE_TIMEOUT', stage, error, responseStatus)
              if (parentSignal.aborted || controller.signal.aborted) throw new PrivatePdfRangeError('PREVIEW_GENERATION_TIMEOUT', stage, error, responseStatus)
              throw new PrivatePdfRangeError('PRIVATE_STORAGE_UNAVAILABLE', stage, error, responseStatus)
            } finally {
              timingsMs.storage += performance.now() - rangeStarted
              requestControllers.delete(controller)
            }
          })()
          rangeCache.set(key, chunkPromise)
          chunkPromise.catch(() => {
            if (rangeCache.get(key) === chunkPromise) rangeCache.delete(key)
          })
        }
        chunks.push({ begin: chunkBegin, end: chunkEnd, bytes: await chunkPromise })
      }
      const combined = new Uint8Array(size)
      for (const chunk of chunks) {
        const copyBegin = Math.max(begin, chunk.begin)
        const copyEnd = Math.min(end, chunk.end)
        combined.set(chunk.bytes.subarray(copyBegin - chunk.begin, copyEnd - chunk.begin), copyBegin - begin)
      }
      return combined
    }

    const initialLength = Math.min(RANGE_CHUNK_BYTES, length)
    const initialController = new AbortController()
    const initial = await getRange(0, initialLength, initialController.signal)
    progress.stage = 'pdfjs_parse'
    progress.status = null
    const transport = new SupabasePdfRangeTransport(length, initial, getRange, fail, () => {
      progress.stage = 'pdfjs_parse'
      progress.status = null
    })
    loadingTask = getDocument({
      range: transport,
      disableStream: true,
      disableAutoFetch: true,
      rangeChunkSize: RANGE_CHUNK_BYTES,
      useSystemFonts: true,
      stopAtErrors: true,
    })
    let pdf
    const parseStarted = performance.now()
    try {
      pdf = await Promise.race([loadingTask.promise, failurePromise])
      timingsMs.pdfjsParse = performance.now() - parseStarted
    } catch (cause) {
      timingsMs.pdfjsParse = performance.now() - parseStarted
      if (cause instanceof PrivatePdfRangeError) throw cause
      throw new PrivatePdfRangeError('INVALID_PDF_SOURCE', 'pdfjs_parse', cause)
    }
    progress.stage = 'page_render'
    progress.sourcePageCount = pdf.numPages
    const renderStarted = performance.now()
    const { output, deliveredPages } = await renderPreviewPages(
      pdf,
      (page, canvas, viewport) => Promise.race([
        page.render({ canvas, canvasContext: canvas.getContext('2d'), viewport }).promise,
        failurePromise,
      ]),
      (pageNumber) => Promise.race([pdf.getPage(pageNumber), failurePromise]),
    )
    timingsMs.pageRender = performance.now() - renderStarted
    let bytes
    const serializationStarted = performance.now()
    progress.stage = 'preview_serialization'
    try {
      bytes = Uint8Array.from(await output.save())
      timingsMs.serialization = performance.now() - serializationStarted
    } catch (cause) {
      throw new PrivatePdfRangeError('PREVIEW_GENERATION_FAILED', 'preview_serialization', cause)
    }
    return { bytes, pageCount: pdf.numPages, deliveredPages, transferredBytes: transferred, rangeRequestCount, timingsMs }
  })()

  try {
    return await Promise.race([operation, timeoutPromise])
  } finally {
    clearTimeout(timer)
    for (const controller of requestControllers) controller.abort()
    loadingTask?.destroy().catch(() => {})
  }
}
