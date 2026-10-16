import { createHash, randomUUID } from 'node:crypto'
import { readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { PDFDocument } from 'pdf-lib'
import { PREVIEW_PAGE_LIMIT } from '../src/lib/knowledgePaperRangePreview.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const privateRoot = path.join(root, 'private-knowledge-papers')
const previewReportPath = path.join(privateRoot, 'preview-generation-report.json')
const inventoryPath = path.join(privateRoot, 'knowledge-paper-source-inventory.json')
const comparisonPath = path.join(privateRoot, 'knowledge-paper-catalogue-comparison.json')
const uploadReportPath = path.join(privateRoot, 'preview-upload-report.json')
const previewBucket = 'knowledge-paper-previews'
const MAX_OBJECT_BYTES = 50 * 1024 * 1024
const uploadApproved = process.argv.includes('--upload')
const checksum = (bytes) => createHash('sha256').update(bytes).digest('hex')
const isWithin = (parent, child) => child.startsWith(`${parent}${path.sep}`)

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'))
}

async function persist(file, value) {
  const temporary = `${file}.partial-${process.pid}-${randomUUID()}`
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 })
  await rename(temporary, file)
}

async function validatePreviewFile(metadata, privateRootPath) {
  const resolved = path.resolve(privateRootPath, ...String(metadata.previewPath).split('/'))
  if (!isWithin(privateRootPath, resolved)) throw new Error('PREVIEW_PATH_INVALID')
  const bytes = await readFile(resolved)
  if (!Number.isSafeInteger(metadata.previewBytes) || bytes.length !== metadata.previewBytes
    || bytes.length < 8 || bytes.length > MAX_OBJECT_BYTES
    || checksum(bytes) !== metadata.previewSha256
    || new TextDecoder().decode(bytes.subarray(0, 5)) !== '%PDF-') {
    throw new Error('PREVIEW_FILE_INVALID')
  }
  const parsed = await PDFDocument.load(bytes, { updateMetadata: false })
  if (parsed.getPageCount() !== metadata.previewPageCount
    || parsed.getPageCount() !== Math.min(PREVIEW_PAGE_LIMIT, metadata.sourcePageCount)) {
    throw new Error('PREVIEW_PAGE_COUNT_INVALID')
  }
  return { bytes, resolved }
}

const fileText = await readFile(path.join(root, '.env.local')).catch((error) => {
  if (error.code === 'ENOENT') return null
  throw error
})
if (fileText) {
  for (const line of fileText.toString('utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (match) process.env[match[1]] = match[2].trim().replace(/^['"]/, '').replace(/['"]$/, '')
  }
}

const [inventory, comparison, previewReport, catalogue] = await Promise.all([
  readJson(inventoryPath),
  readJson(comparisonPath),
  readJson(previewReportPath),
  readJson(path.join(root, 'content', 'knowledge-papers.json')),
])
if (previewReport.previewPageLimit !== PREVIEW_PAGE_LIMIT) throw new Error('PREVIEW_LIMIT_CONFIGURATION_MISMATCH')

const catalogueIds = new Set(catalogue.map((paper) => paper.id))
const inventoryByHash = new Map(inventory.files.map((row) => [row.sha256, row]))
const canonicalByHash = new Map()
for (const [paperId, source] of Object.entries(comparison.sourceByPaperId || {})) {
  if (!catalogueIds.has(paperId)) throw new Error('CANONICAL_CATALOGUE_MAPPING_INVALID')
  if (canonicalByHash.has(source.sha256)) throw new Error('CANONICAL_SOURCE_MAPPING_DUPLICATED')
  canonicalByHash.set(source.sha256, { paperId, source, revisionCandidate: false })
}
const revisionHashes = new Set()
for (const revision of comparison.revisionsRequiringReview || []) {
  if (!catalogueIds.has(revision.paperId)) throw new Error('REVISION_CATALOGUE_MAPPING_INVALID')
  for (const sourcePath of revision.sources || []) {
    const source = inventory.files.find((row) => row.relativePath === sourcePath)
    if (!source || revisionHashes.has(source.sha256) || canonicalByHash.has(source.sha256)) {
      throw new Error('REVISION_SOURCE_MAPPING_INVALID')
    }
    revisionHashes.add(source.sha256)
  }
}

const previewEntries = Object.entries(previewReport.files || {})
if (previewEntries.length === 0) throw new Error('NO_GENERATED_PREVIEWS')
if (previewEntries.length !== canonicalByHash.size + revisionHashes.size) throw new Error('PREVIEW_SOURCE_COUNT_MISMATCH')
const ready = []
const preflightFailures = []
for (const [sha256, generated] of previewEntries) {
  const source = inventoryByHash.get(sha256)
  const canonical = canonicalByHash.get(sha256)
  const isRevision = revisionHashes.has(sha256)
  const paperId = canonical?.paperId || (isRevision
    ? comparison.revisionsRequiringReview.find((group) => group.sources.some((sourcePath) =>
      inventory.files.find((row) => row.relativePath === sourcePath)?.sha256 === sha256))?.paperId
    : null)
  const row = {
    sha256,
    paperId,
    sourceStatus: source?.parseStatus === 'valid' ? 'verified' : 'failed',
    generationStatus: generated.generationStatus,
    validationStatus: generated.validationStatus,
    uploadStatus: 'pending',
    registryStatus: canonical ? 'pending' : 'not_applicable_revision_review',
    servingStatus: canonical ? 'not_verified' : 'not_mapped_pending_canonical_review',
    revisionCandidate: isRevision,
    previewPath: generated.previewPath,
    previewSha256: generated.previewSha256,
  }
  if (!/^[a-f0-9]{64}$/.test(sha256) || !source || source.parseStatus !== 'valid'
    || generated.validationStatus !== 'passed' || !paperId
    || source.pageCount !== generated.sourcePageCount
    || generated.previewPageCount !== Math.min(PREVIEW_PAGE_LIMIT, source.pageCount)) {
    row.uploadStatus = 'blocked_preflight'
    row.failureCode = 'SOURCE_OR_PREVIEW_METADATA_INVALID'
    preflightFailures.push(row)
    continue
  }
  try {
    const validated = await validatePreviewFile(generated, privateRoot)
    ready.push({ sha256, paperId, source, generated, canonical, ...validated, row })
  } catch {
    row.uploadStatus = 'blocked_preflight'
    row.failureCode = 'PREVIEW_FILE_VALIDATION_FAILED'
    preflightFailures.push(row)
  }
}

const report = {
  startedAt: new Date().toISOString(),
  uploadRequested: uploadApproved,
  targetBucket: previewBucket,
  setup: {
    bucketPrivateAndValidated: false,
    previewRegistrySchemaAvailable: false,
    migrationVerifiedAt: null,
  },
  files: Object.fromEntries([...preflightFailures, ...ready.map((entry) => entry.row)].map((row) => [row.sha256, row])),
}
const persistCheckpoint = async () => {
  report.updatedAt = new Date().toISOString()
  await persist(uploadReportPath, report)
}
await persistCheckpoint()
if (preflightFailures.length) throw new Error(`PREVIEW_UPLOAD_PREFLIGHT_FAILED_${preflightFailures.length}`)
const blockReady = async (uploadStatus, failureCode, registryStatus = uploadStatus) => {
  for (const entry of ready) {
    entry.row.uploadStatus = uploadStatus
    entry.row.registryStatus = entry.canonical ? registryStatus : entry.row.registryStatus
    entry.row.servingStatus = 'not_verified'
    entry.row.failureCode = failureCode
  }
  await persistCheckpoint()
}

const paperIds = new Set(ready.filter((entry) => entry.canonical).map((entry) => entry.paperId))
if (paperIds.size !== canonicalByHash.size) throw new Error('CANONICAL_PAPER_MAPPING_COUNT_MISMATCH')

if (!uploadApproved) {
  console.log(JSON.stringify({
    event: 'preview-upload-preflight-passed',
    validatedFiles: ready.length,
    canonicalPaperMappings: canonicalByHash.size,
    revisionPreviewFiles: revisionHashes.size,
    uploadRequested: false,
  }))
  process.exit(0)
}

if (process.env.KNOWLEDGE_PAPER_PREVIEW_BUCKET !== previewBucket) {
  await blockReady('blocked_configuration', 'PREVIEW_BUCKET_ENV_MISMATCH', 'blocked_configuration')
  throw new Error('PREVIEW_BUCKET_ENV_MISMATCH')
}
const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !serviceRoleKey) {
  await blockReady('blocked_configuration', 'SUPABASE_SERVER_CONFIGURATION_MISSING', 'blocked_configuration')
  throw new Error('SUPABASE_SERVER_CONFIGURATION_MISSING')
}
let client
try {
  client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
} catch {
  await blockReady('blocked_configuration', 'SUPABASE_SERVER_CONFIGURATION_INVALID', 'blocked_configuration')
  throw new Error('SUPABASE_SERVER_CONFIGURATION_INVALID')
}

let bucket
try {
  const response = await client.storage.getBucket(previewBucket)
  if (response.error || !response.data) throw new Error('PREVIEW_BUCKET_MISSING')
  bucket = response.data
} catch {
  await blockReady('blocked_storage_setup', 'PREVIEW_BUCKET_MISSING_OR_UNAVAILABLE')
  throw new Error('PREVIEW_BUCKET_MISSING_OR_UNAVAILABLE')
}
const bucketIsPublic = bucket.public !== false
const sizeLimit = Number(bucket.fileSizeLimit ?? bucket.file_size_limit)
const allowedMimeTypes = bucket.allowedMimeTypes || bucket.allowed_mime_types
if (bucketIsPublic || !Number.isSafeInteger(sizeLimit) || sizeLimit < MAX_OBJECT_BYTES
  || sizeLimit > MAX_OBJECT_BYTES || !Array.isArray(allowedMimeTypes)
  || !allowedMimeTypes.includes('application/pdf')) {
  await blockReady('blocked_storage_setup', 'PREVIEW_BUCKET_CONFIGURATION_INVALID')
  throw new Error('PREVIEW_BUCKET_CONFIGURATION_INVALID')
}
report.setup.bucketPrivateAndValidated = true

let registryCheckError
try {
  ({ error: registryCheckError } = await client.from('knowledge_paper_previews_private')
    .select('paper_id')
    .limit(1))
} catch {
  await blockReady('blocked_registry_setup', 'PREVIEW_REGISTRY_UNAVAILABLE')
  throw new Error('PREVIEW_REGISTRY_UNAVAILABLE')
}
if (registryCheckError) {
  await blockReady('blocked_registry_setup', 'PREVIEW_REGISTRY_MIGRATION_MISSING')
  throw new Error('PREVIEW_REGISTRY_MIGRATION_MISSING')
}
report.setup.previewRegistrySchemaAvailable = true
report.setup.migrationVerifiedAt = new Date().toISOString()
await persistCheckpoint()

for (const entry of ready) {
  const storagePath = entry.generated.previewPath
  if (storagePath !== `previews/${entry.paperId}/${entry.sha256}.pdf`) {
    entry.row.uploadStatus = 'blocked_preflight'
    entry.row.failureCode = 'PREVIEW_STORAGE_PATH_MISMATCH'
    await persistCheckpoint()
    continue
  }
  try {
    const { error: uploadError } = await client.storage.from(previewBucket).upload(storagePath, entry.bytes, {
      contentType: 'application/pdf',
      upsert: true,
    })
    if (uploadError) throw new Error('PREVIEW_UPLOAD_FAILED')
    entry.row.uploadStatus = 'passed'
    entry.row.uploadedAt = new Date().toISOString()

    if (entry.canonical) {
      const { error: mappingError } = await client.from('knowledge_paper_previews_private').upsert({
        paper_id: entry.paperId,
        preview_storage_path: storagePath,
        source_sha256: entry.sha256,
        source_page_count: entry.source.pageCount,
        active: true,
      }, { onConflict: 'paper_id' })
      if (mappingError) throw new Error('PREVIEW_REGISTRY_MAPPING_FAILED')
      const { data: mapping, error: readbackError } = await client.from('knowledge_paper_previews_private')
        .select('paper_id, preview_storage_path, source_sha256, source_page_count, active')
        .eq('paper_id', entry.paperId)
        .maybeSingle()
      if (readbackError || !mapping || mapping.preview_storage_path !== storagePath
        || mapping.source_sha256 !== entry.sha256 || Number(mapping.source_page_count) !== entry.source.pageCount
        || mapping.active !== true) throw new Error('PREVIEW_REGISTRY_VERIFICATION_FAILED')
      entry.row.registryStatus = 'passed'
      entry.row.servingStatus = 'pending_api_verification'
    } else {
      entry.row.registryStatus = 'not_applicable_revision_review'
      entry.row.servingStatus = 'not_mapped_pending_canonical_review'
    }
    delete entry.row.failureCode
  } catch (uploadError) {
    const failureCode = /^[A-Z0-9_]{1,80}$/.test(uploadError?.message || '')
      ? uploadError.message
      : 'PREVIEW_UPLOAD_FAILED'
    if (entry.row.uploadStatus !== 'passed') entry.row.uploadStatus = 'failed'
    if (entry.canonical && entry.row.registryStatus !== 'passed') entry.row.registryStatus = 'failed'
    entry.row.servingStatus = 'not_verified'
    entry.row.failureCode = failureCode
  }
  if (entry.row.uploadStatus === 'passed' && entry.canonical && entry.row.registryStatus === 'passed') {
    try {
      const apiBase = (process.env.KNOWLEDGE_PAPER_PREVIEW_API_URL || 'http://127.0.0.1:3001').replace(/\/+$/, '')
      const response = await fetch(`${apiBase}/api/knowledge-papers/${encodeURIComponent(entry.paperId)}?mode=preview`, {
        signal: AbortSignal.timeout(45_000),
        cache: 'no-store',
      })
      const contentLength = Number(response.headers.get('content-length'))
      if (response.status !== 200 || response.headers.get('content-type')?.split(';')[0] !== 'application/pdf'
        || response.headers.get('x-paper-id') !== entry.paperId
        || Number(response.headers.get('x-paper-page-count')) !== entry.source.pageCount
        || Number(response.headers.get('x-paper-preview-pages')) !== Math.min(PREVIEW_PAGE_LIMIT, entry.source.pageCount)
        || (Number.isSafeInteger(contentLength) && contentLength > MAX_OBJECT_BYTES)) {
        entry.row.servingStatus = 'failed'
        entry.row.apiResponseStatus = response.status
        entry.row.failureCode = 'PREVIEW_API_RESPONSE_INVALID'
      } else {
        const bytes = new Uint8Array(await response.arrayBuffer())
        if (bytes.length < 8 || bytes.length > MAX_OBJECT_BYTES
          || new TextDecoder().decode(bytes.subarray(0, 5)) !== '%PDF-'
          || (await PDFDocument.load(bytes, { updateMetadata: false })).getPageCount()
            !== Math.min(PREVIEW_PAGE_LIMIT, entry.source.pageCount)) {
          entry.row.servingStatus = 'failed'
          entry.row.apiResponseStatus = response.status
          entry.row.failureCode = 'PREVIEW_API_RESPONSE_INVALID'
        } else {
          entry.row.servingStatus = 'passed'
          entry.row.apiResponseStatus = response.status
          entry.row.apiVerifiedAt = new Date().toISOString()
          delete entry.row.failureCode
        }
      }
    } catch {
      entry.row.servingStatus = 'failed'
      entry.row.failureCode = 'PREVIEW_API_VERIFICATION_FAILED'
    }
  }
  await persistCheckpoint()
  console.log(JSON.stringify({
    event: 'preview-upload-result',
    paperId: entry.paperId,
    sha256: entry.sha256,
    revisionCandidate: entry.row.revisionCandidate,
    uploadStatus: entry.row.uploadStatus,
    registryStatus: entry.row.registryStatus,
    servingStatus: entry.row.servingStatus,
    apiResponseStatus: entry.row.apiResponseStatus || null,
    failureCode: entry.row.failureCode || null,
  }))
}

const fileRows = Object.values(report.files)
report.finishedAt = new Date().toISOString()
report.summary = {
  attemptedFiles: ready.length,
  uploadedFiles: fileRows.filter((row) => row.uploadStatus === 'passed').length,
  failedFiles: fileRows.filter((row) => row.uploadStatus === 'failed').length,
  blockedFiles: fileRows.filter((row) => row.uploadStatus.startsWith('blocked_')).length,
  canonicalPaperMappings: fileRows.filter((row) => row.registryStatus === 'passed').length,
  revisionFilesPendingCanonicalReview: fileRows.filter((row) => row.revisionCandidate && row.uploadStatus === 'passed').length,
  servedVerified: fileRows.filter((row) => row.servingStatus === 'passed').length,
}
await persistCheckpoint()
console.log(JSON.stringify({ event: 'preview-upload-complete', ...report.summary }))
