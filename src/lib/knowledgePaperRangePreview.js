import { createCanvas } from '@napi-rs/canvas'
import { PDFDataRangeTransport, getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { PDFDocument } from 'pdf-lib'

export const PREVIEW_PAGE_LIMIT = 5
export const RANGE_CHUNK_BYTES = 64 * 1024
export const RANGE_REQUEST_TIMEOUT_MS = 8_000
export const PREVIEW_TOTAL_TIMEOUT_MS = 45_000
export const PREVIEW_TRANSFER_BUDGET_BYTES = 8 * 1024 * 1024
const MAX_PDFJS_RANGE_BYTES = 8 * 1024 * 1024
const STORAGE_RANGE_BYTES = RANGE_CHUNK_BYTES
const MAX_PAGE_PIXELS = 4_000_000

export class PrivatePdfRangeError extends Error {
  constructor(code) {
    super(code)
    this.name = 'PrivatePdfRangeError'
    this.code = code
  }
}

const makeObjectUrl = (supabaseUrl, bucket, storagePath) => {
  const base = new URL(supabaseUrl)
  const encodedPath = storagePath.split('/').map(encodeURIComponent).join('/')
  return new URL(`/storage/v1/object/authenticated/${encodeURIComponent(bucket)}/${encodedPath}`, base).toString()
}

const waitForResponseBytes = async (response, expectedLength, signal) => {
  const reader = response.body?.getReader()
  if (!reader) throw new PrivatePdfRangeError('PRIVATE_STORAGE_RANGE_INVALID')
  const chunks = []
  let received = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      received += value.byteLength
      if (received > expectedLength) {
        await reader.cancel().catch(() => {})
        throw new PrivatePdfRangeError('PRIVATE_STORAGE_RANGE_INVALID')
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  if (signal.aborted) throw new PrivatePdfRangeError('PRIVATE_STORAGE_TIMEOUT')
  if (received !== expectedLength) throw new PrivatePdfRangeError('PRIVATE_STORAGE_RANGE_INVALID')
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
  constructor(length, initialData, fetchRange, fail) {
    super(length, initialData, false)
    this.fetchRange = fetchRange
    this.fail = fail
    this.controllers = new Set()
  }

  requestDataRange(begin, end) {
    const controller = new AbortController()
    this.controllers.add(controller)
    this.fetchRange(begin, end, controller.signal)
      .then((chunk) => this.onDataRange(begin, chunk))
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
 * rendered PDF containing at most five pages. The original is never assembled
 * into one buffer or returned to the caller.
 */
export async function createPrivatePdfPreview({ supabaseUrl, serviceRoleKey, bucket, storagePath, fetchImpl = fetch }) {
  const url = makeObjectUrl(supabaseUrl, bucket, storagePath)
  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Accept-Encoding': 'identity',
  }
  const requestControllers = new Set()
  let transferred = 0
  let failed = false
  let rejectFailure
  let loadingTask
  let timer
  const failurePromise = new Promise((_, reject) => { rejectFailure = reject })
  failurePromise.catch(() => {})
  const fail = (error) => {
    if (failed) return
    failed = true
    const safeError = error instanceof PrivatePdfRangeError ? error : new PrivatePdfRangeError('PRIVATE_STORAGE_UNAVAILABLE')
    rejectFailure(safeError)
    for (const controller of requestControllers) controller.abort()
  }
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new PrivatePdfRangeError('PREVIEW_GENERATION_TIMEOUT')
      fail(error)
      reject(error)
    }, PREVIEW_TOTAL_TIMEOUT_MS)
  })

  const operation = (async () => {
    const headController = new AbortController()
    requestControllers.add(headController)
    let metadata
    try {
      metadata = await fetchImpl(url, {
        method: 'HEAD',
        headers,
        signal: AbortSignal.any([headController.signal, AbortSignal.timeout(RANGE_REQUEST_TIMEOUT_MS)]),
      })
    } catch {
      throw new PrivatePdfRangeError('PRIVATE_STORAGE_UNAVAILABLE')
    } finally {
      requestControllers.delete(headController)
    }
    if (!metadata.ok) throw new PrivatePdfRangeError(metadata.status === 404 ? 'PRIVATE_OBJECT_MISSING' : metadata.status === 401 || metadata.status === 403 ? 'PRIVATE_STORAGE_ACCESS_DENIED' : 'PRIVATE_STORAGE_UNAVAILABLE')
    if (!/^bytes$/i.test(metadata.headers.get('accept-ranges') || '')) throw new PrivatePdfRangeError('PRIVATE_STORAGE_RANGE_UNSUPPORTED')
    const length = Number(metadata.headers.get('content-length'))
    if (!Number.isSafeInteger(length) || length < 8) throw new PrivatePdfRangeError('PRIVATE_STORAGE_RANGE_INVALID')

    const getRange = async (begin, end, parentSignal) => {
      const size = end - begin
      if (!Number.isSafeInteger(begin) || !Number.isSafeInteger(end) || begin < 0 || end > length || size < 1) {
        throw new PrivatePdfRangeError('PRIVATE_STORAGE_RANGE_INVALID')
      }
      if (size > MAX_PDFJS_RANGE_BYTES) throw new PrivatePdfRangeError('PRIVATE_STORAGE_RANGE_TOO_LARGE')
      const transferBudget = length <= RANGE_CHUNK_BYTES
        ? Math.min(PREVIEW_TRANSFER_BUDGET_BYTES, length + RANGE_CHUNK_BYTES)
        : Math.min(PREVIEW_TRANSFER_BUDGET_BYTES, length - 1)
      if (transferred + size > transferBudget) {
        throw new PrivatePdfRangeError('PREVIEW_RANGE_BUDGET_EXCEEDED')
      }
      const chunks = []
      for (let chunkBegin = begin; chunkBegin < end; chunkBegin += STORAGE_RANGE_BYTES) {
        const chunkEnd = Math.min(end, chunkBegin + STORAGE_RANGE_BYTES)
        const chunkSize = chunkEnd - chunkBegin
        transferred += chunkSize
        const controller = new AbortController()
        requestControllers.add(controller)
        const signal = AbortSignal.any([parentSignal, controller.signal, AbortSignal.timeout(RANGE_REQUEST_TIMEOUT_MS)])
        try {
          const response = await fetchImpl(url, {
            method: 'GET',
            headers: { ...headers, Range: `bytes=${chunkBegin}-${chunkEnd - 1}` },
            signal,
          })
          const expectedRange = `bytes ${chunkBegin}-${chunkEnd - 1}/${length}`
          if (response.status !== 206) {
            await response.body?.cancel().catch(() => {})
            throw new PrivatePdfRangeError(response.status === 404 ? 'PRIVATE_OBJECT_MISSING' : 'PRIVATE_STORAGE_RANGE_RESPONSE_INVALID')
          }
          if (response.headers.get('content-range') !== expectedRange || Number(response.headers.get('content-length')) !== chunkSize || response.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() !== 'application/pdf') {
            await response.body?.cancel().catch(() => {})
            throw new PrivatePdfRangeError('PRIVATE_STORAGE_RANGE_RESPONSE_INVALID')
          }
          const chunk = await waitForResponseBytes(response, chunkSize, signal)
          if (chunkBegin === 0 && new TextDecoder().decode(chunk.subarray(0, 5)) !== '%PDF-') throw new PrivatePdfRangeError('INVALID_PDF_SOURCE')
          chunks.push(chunk)
        } catch (error) {
          if (error instanceof PrivatePdfRangeError) throw error
          if (error?.name === 'AbortError' || error?.name === 'TimeoutError') throw new PrivatePdfRangeError('PRIVATE_STORAGE_TIMEOUT')
          if (parentSignal.aborted || controller.signal.aborted) throw new PrivatePdfRangeError('PREVIEW_GENERATION_TIMEOUT')
          throw new PrivatePdfRangeError('PRIVATE_STORAGE_UNAVAILABLE')
        } finally {
          requestControllers.delete(controller)
        }
      }
      if (chunks.length === 1) return chunks[0]
      const combined = new Uint8Array(size)
      let offset = 0
      for (const chunk of chunks) {
        combined.set(chunk, offset)
        offset += chunk.length
      }
      return combined
    }

    const initialLength = Math.min(RANGE_CHUNK_BYTES, length)
    const initialController = new AbortController()
    const initial = await getRange(0, initialLength, initialController.signal)
    const transport = new SupabasePdfRangeTransport(length, initial, getRange, fail)
    loadingTask = getDocument({
      range: transport,
      disableStream: true,
      disableAutoFetch: true,
      rangeChunkSize: RANGE_CHUNK_BYTES,
      useSystemFonts: true,
      stopAtErrors: true,
    })
    const pdf = await Promise.race([loadingTask.promise, failurePromise])
    const deliveredPages = Math.min(PREVIEW_PAGE_LIMIT, pdf.numPages)
    if (deliveredPages < 1) throw new PrivatePdfRangeError('INVALID_PDF_SOURCE')

    const output = await PDFDocument.create()
    for (let pageNumber = 1; pageNumber <= deliveredPages; pageNumber += 1) {
      const page = await Promise.race([pdf.getPage(pageNumber), failurePromise])
      const baseViewport = page.getViewport({ scale: 1 })
      const scale = Math.min(1.5, Math.sqrt(MAX_PAGE_PIXELS / (baseViewport.width * baseViewport.height)))
      const viewport = page.getViewport({ scale })
      const canvas = createCanvas(Math.max(1, Math.ceil(viewport.width)), Math.max(1, Math.ceil(viewport.height)))
      try {
        await Promise.race([page.render({ canvas, canvasContext: canvas.getContext('2d'), viewport }).promise, failurePromise])
        const png = canvas.toBuffer('image/png')
        const image = await output.embedPng(png)
        const outputPage = output.addPage([viewport.width, viewport.height])
        outputPage.drawImage(image, { x: 0, y: 0, width: viewport.width, height: viewport.height })
      } finally {
        canvas.width = 0
        canvas.height = 0
      }
    }
    const bytes = Uint8Array.from(await output.save())
    return { bytes, pageCount: pdf.numPages, deliveredPages, transferredBytes: transferred }
  })()

  try {
    return await Promise.race([operation, timeoutPromise])
  } finally {
    clearTimeout(timer)
    for (const controller of requestControllers) controller.abort()
    loadingTask?.destroy().catch(() => {})
  }
}
