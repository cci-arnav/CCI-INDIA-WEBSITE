import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { PDFDocument } from 'pdf-lib'
import { createPrivatePdfPreview, PREVIEW_PAGE_LIMIT } from '../src/lib/knowledgePaperRangePreview.js'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envFile = path.join(projectRoot, '.env.local')
const catalogueFile = path.join(projectRoot, 'content', 'knowledge-papers.json')
const reportFile = path.join(projectRoot, 'scripts', 'knowledge-paper-preview-audit-2026-10-16.json')
const bucket = 'knowledge-papers-private'
const concurrency = 2
const timeoutMs = 10_000
const validToken = (value, pattern) => typeof value === 'string' && pattern.test(value) ? value : null
const tokenPatterns = {
  code: /^[A-Z0-9_]{1,64}$/,
  stage: /^[a-z][a-z0-9_]{0,63}$/,
  errorClass: /^[A-Za-z][A-Za-z0-9]{0,63}$/,
}

if (existsSync(envFile)) process.loadEnvFile(envFile)
const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const catalogue = JSON.parse(readFileSync(catalogueFile, 'utf8'))
let previousRows = new Map()
if (existsSync(reportFile)) {
  try {
    const previousReport = JSON.parse(readFileSync(reportFile, 'utf8'))
    previousRows = new Map((previousReport.papers || []).filter(Boolean).map((paper) => [paper.paperId, paper]))
  } catch {
    previousRows = new Map()
  }
}
const mappings = new Map()
let registryFailure = null

if (supabaseUrl && serviceRoleKey) {
  const boundedFetch = (input, init = {}) => fetch(input, {
    ...init,
    signal: init.signal
      ? AbortSignal.any([init.signal, AbortSignal.timeout(timeoutMs)])
      : AbortSignal.timeout(timeoutMs),
  })
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: boundedFetch },
  })
  const { data, error } = await supabase
    .from('knowledge_papers_private')
    .select('paper_id, storage_path, active')
    .limit(1000)
  if (error) registryFailure = validToken(error.code, tokenPatterns.code) || 'REGISTRY_UNAVAILABLE'
  else for (const mapping of data || []) mappings.set(mapping.paper_id, mapping)
} else {
  registryFailure = 'SERVER_CONFIGURATION_MISSING'
}

const mappingFingerprint = (paper, mapping) => mapping
  ? createHash('sha256').update(`${paper.id}\0${mapping.storage_path}\0${mapping.active}`).digest('hex')
  : null

const makeUnavailableRow = (paper, code) => ({
  paperId: paper.id,
  title: paper.title,
  mappingStatus: 'unavailable',
  objectStatus: 'unverified',
  sourceSignatureValid: null,
  generatedSignatureValid: null,
  sourceParseStatus: 'not_checked',
  previewStatus: 'not_checked',
  sourcePageCount: null,
  sourceSizeBytes: null,
  generatedPageCount: null,
  generationMs: null,
  timingsMs: null,
  transferredBytes: null,
  rangeRequestCount: null,
  mappingFingerprint: null,
  failure: { code, stage: 'registry_lookup', errorClass: null, status: null },
})

const auditPaper = async (paper) => {
  if (registryFailure) return makeUnavailableRow(paper, registryFailure)
  const mapping = mappings.get(paper.id)
  if (!mapping) return {
    ...makeUnavailableRow(paper, 'REGISTRY_MAPPING_MISSING'),
    mappingStatus: 'missing',
  }
  const row = {
    paperId: paper.id,
    title: paper.title,
    mappingStatus: mapping.active ? 'active' : 'inactive',
    objectStatus: 'unverified',
    sourceSignatureValid: null,
    generatedSignatureValid: null,
    sourceParseStatus: 'not_checked',
    previewStatus: 'not_checked',
    sourcePageCount: null,
    sourceSizeBytes: null,
    generatedPageCount: null,
    generationMs: null,
    timingsMs: null,
    transferredBytes: null,
    rangeRequestCount: null,
    mappingFingerprint: mappingFingerprint(paper, mapping),
    failure: null,
  }
  const previous = previousRows.get(paper.id)
  if (mapping.active && previous?.previewStatus === 'success' && previous.mappingFingerprint === row.mappingFingerprint) return previous
  if (!mapping.active) {
    row.previewStatus = 'unavailable'
    row.failure = { code: 'PAPER_INACTIVE', stage: 'registry_mapping', errorClass: null, status: null }
    return row
  }

  const started = performance.now()
  try {
    const preview = await createPrivatePdfPreview({
      supabaseUrl,
      serviceRoleKey,
      bucket,
      storagePath: mapping.storage_path,
    })
    row.objectStatus = 'found'
    // The range helper checks the source signature before PDF.js parsing. A
    // returned preview therefore confirms that the private source parsed.
    row.sourceSignatureValid = true
    row.sourceParseStatus = 'parsed'
    row.sourcePageCount = preview.pageCount
    row.sourceSizeBytes = preview.sourceSizeBytes ?? null
    row.generatedPageCount = preview.deliveredPages
    row.generationMs = Math.round(performance.now() - started)
    row.transferredBytes = preview.transferredBytes
    row.rangeRequestCount = preview.rangeRequestCount
    row.timingsMs = Object.fromEntries(Object.entries(preview.timingsMs || {}).map(([key, value]) => [key, Number.isFinite(value) ? Math.round(value) : value]))
    const signature = new TextDecoder().decode(preview.bytes.subarray(0, 5))
    const deliveredPdf = await PDFDocument.load(preview.bytes, { updateMetadata: false })
    const generatedPageCount = deliveredPdf.getPageCount()
    row.generatedSignatureValid = signature === '%PDF-'
    row.generatedPageCount = generatedPageCount
    if (!row.generatedSignatureValid || generatedPageCount !== preview.deliveredPages || generatedPageCount > PREVIEW_PAGE_LIMIT) {
      row.previewStatus = 'failed'
      row.failure = { code: 'GENERATED_PREVIEW_VALIDATION_FAILED', stage: 'generated_preview_validation', errorClass: null, status: null }
    } else {
      row.previewStatus = 'success'
    }
  } catch (error) {
    const code = validToken(error?.code, tokenPatterns.code) || 'PREVIEW_GENERATION_FAILED'
    const stage = validToken(error?.stage, tokenPatterns.stage) || 'preview_pipeline'
    const errorClass = validToken(error?.upstreamErrorName || error?.name, tokenPatterns.errorClass)
    const status = Number.isInteger(error?.status) && error.status >= 100 && error.status <= 599 ? error.status : null
    row.generationMs = Math.round(performance.now() - started)
    row.objectStatus = code === 'PRIVATE_OBJECT_MISSING'
      ? 'missing'
      : [200, 206].includes(status) || Number.isSafeInteger(error?.sourceSizeBytes) || ['range_validation', 'pdf_signature', 'pdfjs_parse', 'page_render', 'preview_serialization'].includes(stage)
        ? 'found'
        : 'unverified'
    row.sourceSignatureValid = typeof error?.sourceSignatureValid === 'boolean' ? error.sourceSignatureValid
      : stage === 'pdf_signature' ? false
        : ['range_validation', 'pdfjs_parse', 'page_render', 'preview_serialization'].includes(stage) ? true : null
    row.sourceSizeBytes = Number.isSafeInteger(error?.sourceSizeBytes) ? error.sourceSizeBytes : null
    row.sourcePageCount = Number.isSafeInteger(error?.sourcePageCount) ? error.sourcePageCount : null
    row.timingsMs = error?.timingsMs || null
    row.sourceParseStatus = stage === 'pdfjs_parse' ? 'failed'
      : Number.isSafeInteger(error?.sourcePageCount) || ['page_render', 'preview_serialization'].includes(stage) ? 'parsed'
        : stage === 'range_validation' ? 'incomplete' : 'not_checked'
    row.previewStatus = 'failed'
    row.failure = { code, stage, errorClass, status }
  }
  return row
}

const report = {
  generatedAt: new Date().toISOString(),
  catalogueCount: catalogue.length,
  registryStatus: registryFailure ? 'unavailable' : 'read_only_verified',
  bucket,
  previewPageLimit: PREVIEW_PAGE_LIMIT,
  concurrency,
  security: {
    storageAccess: 'server-side authenticated range requests only',
    originalsReturned: false,
    fullDocumentMode: 'PREVIEW_ONLY',
    secretsOrStoragePathsRecorded: false,
  },
  summary: {},
  papers: catalogue.map((paper) => {
    const previous = previousRows.get(paper.id)
    const mapping = mappings.get(paper.id)
    const fingerprint = mapping ? mappingFingerprint(paper, mapping) : null
    return previous?.previewStatus === 'success' && previous.mappingFingerprint === fingerprint ? previous : undefined
  }),
}

let nextIndex = 0
const persistReport = () => {
  const completeRows = report.papers.filter(Boolean)
  const count = (predicate) => completeRows.filter(predicate).length
  report.summary = {
    audited: completeRows.length,
    activeMappings: count((paper) => paper.mappingStatus === 'active'),
    missingMappings: count((paper) => paper.mappingStatus === 'missing'),
    inactiveMappings: count((paper) => paper.mappingStatus === 'inactive'),
    objectsFound: count((paper) => paper.objectStatus === 'found'),
    objectsMissing: count((paper) => paper.objectStatus === 'missing'),
    readableSources: count((paper) => paper.sourceParseStatus === 'parsed'),
    parseIncomplete: count((paper) => paper.sourceParseStatus === 'incomplete'),
    previewsSucceeded: count((paper) => paper.previewStatus === 'success'),
    previewsFailed: count((paper) => paper.previewStatus === 'failed'),
    previewsNotChecked: count((paper) => paper.previewStatus === 'not_checked'),
  }
  writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 })
}

const worker = async () => {
  while (true) {
    const index = nextIndex++
    if (index >= catalogue.length) return
    const result = await auditPaper(catalogue[index])
    report.papers[index] = result
    persistReport()
    const message = {
      paperId: result.paperId,
      previewStatus: result.previewStatus,
      ...(result.failure ? { failure: result.failure } : {}),
      ...(result.generationMs !== null ? { generationMs: result.generationMs } : {}),
    }
    process.stdout.write(`${JSON.stringify(message)}\n`)
  }
}

persistReport()
await Promise.all(Array.from({ length: Math.min(concurrency, catalogue.length) }, worker))
persistReport()
process.stdout.write(`${JSON.stringify({ reportFile: path.relative(projectRoot, reportFile), ...report.summary })}\n`)
