import { Worker } from 'node:worker_threads'

export const PUBLIC_PREVIEW_PAGE_LIMIT = 5
export const isPublicPreviewMode = (mode) => !mode || mode === 'preview'
const PREVIEW_PROCESS_TIMEOUT_MS = 30_000

const workerSource = `
const { parentPort, workerData } = require('node:worker_threads')
const { PDFDocument } = require('pdf-lib')
;(async () => {
  try {
    const original = await PDFDocument.load(new Uint8Array(workerData))
    const pageCount = original.getPageCount()
    const deliveredPages = Math.min(5, pageCount)
    const output = await PDFDocument.create()
    const pages = await output.copyPages(original, Array.from({ length: deliveredPages }, (_, index) => index))
    pages.forEach((page) => output.addPage(page))
    const bytes = Uint8Array.from(await output.save())
    parentPort.postMessage({ bytes, pageCount, deliveredPages }, [bytes.buffer])
  } catch {
    parentPort.postMessage({ error: 'INVALID_PDF_SOURCE' })
  }
})()
`

// Parsing/serialization is isolated so malformed or pathologically slow PDFs can
// be terminated without leaving work running inside the API request process.
export async function createPdfDelivery(sourceBytes) {
  const input = Uint8Array.from(sourceBytes)
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerSource, { eval: true, workerData: input.buffer, transferList: [input.buffer] })
    let settled = false
    const finish = async (error, result) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      await worker.terminate().catch(() => {})
      if (error) reject(error)
      else resolve(result)
    }
    const timer = setTimeout(() => finish(new Error('PDF_PREVIEW_PROCESS_TIMEOUT')), PREVIEW_PROCESS_TIMEOUT_MS)
    worker.once('message', (result) => {
      if (result?.error) finish(new Error(result.error))
      else finish(null, result)
    })
    worker.once('error', () => finish(new Error('PDF_PREVIEW_PROCESS_FAILED')))
    worker.once('exit', (code) => {
      if (code !== 0 && !settled) finish(new Error('PDF_PREVIEW_PROCESS_FAILED'))
    })
  })
}
