import { createHash, randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument } from 'pdf-lib'
import { createLocalPdfPreview, PREVIEW_PAGE_LIMIT } from '../src/lib/knowledgePaperRangePreview.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const privateRoot = path.join(root, 'private-knowledge-papers')
const extractedRoot = path.join(privateRoot, 'extracted')
const previewRoot = path.join(privateRoot, 'previews')
const inventoryPath = path.join(privateRoot, 'knowledge-paper-source-inventory.json')
const reportPath = path.join(privateRoot, 'preview-generation-report.json')
const MAX_SOURCE_BYTES = 100 * 1024 * 1024
const MAX_PREVIEW_BYTES = 50 * 1024 * 1024
const checksum = (bytes) => createHash('sha256').update(bytes).digest('hex')
const isWithin = (parent, child) => child.startsWith(`${parent}${path.sep}`)

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return fallback
    throw error
  }
}

async function saveReport(report) {
  const temporary = `${reportPath}.partial-${process.pid}-${randomUUID()}`
  await writeFile(temporary, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 })
  await rename(temporary, reportPath)
}

const inventory = await readJson(inventoryPath, null)
if (!inventory?.files || !Array.isArray(inventory.files)) throw new Error('SOURCE_INVENTORY_MISSING')

const sourceRows = inventory.files.filter((row) => row.parseStatus === 'valid'
  && row.duplicateOf === null
  && ['exact_match', 'different_edition_or_revision', 'genuinely_new_paper'].includes(row.classification))
const report = await readJson(reportPath, {
  startedAt: new Date().toISOString(),
  previewPageLimit: PREVIEW_PAGE_LIMIT,
  files: {},
})
const paperCatalog = JSON.parse(await readFile(path.join(root, 'content', 'knowledge-papers.json'), 'utf8'))
const catalogueIds = new Set(paperCatalog.map((paper) => paper.id))
let completed = 0

for (const source of sourceRows) {
  const paperId = source.newPaperId || source.catalogueMatch?.candidateIds?.[0]
  if (!paperId || !catalogueIds.has(paperId)) throw new Error(`SOURCE_PAPER_MAPPING_INVALID_${source.sha256}`)
  if (!/^[a-f0-9]{64}$/.test(source.sha256 || '')) throw new Error('SOURCE_CHECKSUM_INVALID')
  if (!Number.isSafeInteger(source.sizeBytes) || source.sizeBytes < 8 || source.sizeBytes > MAX_SOURCE_BYTES) {
    throw new Error(`SOURCE_SIZE_OUT_OF_BOUNDS_${source.sha256}`)
  }
  const extractedPath = path.resolve(extractedRoot, ...String(source.extractedPath).split('/'))
  if (!isWithin(extractedRoot, extractedPath) || !existsSync(extractedPath)) throw new Error(`SOURCE_FILE_MISSING_${source.sha256}`)
  const outputDirectory = path.join(previewRoot, paperId)
  const outputPath = path.join(outputDirectory, `${source.sha256}.pdf`)
  const old = report.files[source.sha256]
  let result = {
    paperId,
    source: source.relativePath,
    sourceSha256: source.sha256,
    sourceBytes: source.sizeBytes,
    sourcePageCount: source.pageCount,
    sourceStatus: 'pending',
    generationStatus: 'pending',
    validationStatus: 'pending',
    uploadStatus: old?.uploadStatus || 'not_attempted',
    servingStatus: old?.servingStatus || 'pending_storage_configuration',
    previewPath: path.relative(privateRoot, outputPath).split(path.sep).join('/'),
    previewBytes: null,
    previewPageCount: null,
    revisionCandidate: source.classification === 'different_edition_or_revision',
  }
  report.files[source.sha256] = result

  try {
    const sourceBytes = await readFile(extractedPath)
    if (sourceBytes.length !== source.sizeBytes || checksum(sourceBytes) !== source.sha256) {
      throw new Error('SOURCE_CHECKSUM_OR_SIZE_MISMATCH')
    }
    if (new TextDecoder().decode(sourceBytes.subarray(0, 5)) !== '%PDF-') throw new Error('SOURCE_PDF_SIGNATURE_INVALID')
    result.sourceStatus = 'verified'

    let previewBytes = null
    if (old?.sourceSha256 === source.sha256 && old?.validationStatus === 'passed' && existsSync(outputPath)) {
      try {
        const candidate = await readFile(outputPath)
        const parsed = await PDFDocument.load(candidate, { updateMetadata: false })
        const expectedPages = Math.min(PREVIEW_PAGE_LIMIT, source.pageCount)
        if (candidate.length <= MAX_PREVIEW_BYTES && parsed.getPageCount() === expectedPages) previewBytes = candidate
      } catch {
        previewBytes = null
      }
    }
    if (!previewBytes) {
      result.generationStatus = 'in_progress'
      await mkdir(outputDirectory, { recursive: true })
      const generated = await createLocalPdfPreview(sourceBytes)
      if (generated.pageCount !== source.pageCount) throw new Error('SOURCE_PAGE_COUNT_CHANGED')
      if (generated.deliveredPages !== Math.min(PREVIEW_PAGE_LIMIT, source.pageCount)) throw new Error('PREVIEW_PAGE_LIMIT_MISMATCH')
      previewBytes = generated.bytes
      if (previewBytes.length > MAX_PREVIEW_BYTES) throw new Error('PREVIEW_SIZE_EXCEEDS_STORAGE_LIMIT')
      const temporary = `${outputPath}.partial-${process.pid}-${randomUUID()}`
      await writeFile(temporary, previewBytes, { mode: 0o600 })
      await rename(temporary, outputPath)
      result.generationStatus = 'passed'
    } else {
      result.generationStatus = 'reused_validated_output'
    }

    if (new TextDecoder().decode(previewBytes.subarray(0, 5)) !== '%PDF-') throw new Error('PREVIEW_PDF_SIGNATURE_INVALID')
    const parsedPreview = await PDFDocument.load(previewBytes, { updateMetadata: false })
    const deliveredPages = Math.min(PREVIEW_PAGE_LIMIT, source.pageCount)
    if (parsedPreview.getPageCount() !== deliveredPages) throw new Error('PREVIEW_PAGE_COUNT_INVALID')
    result.previewBytes = previewBytes.length
    result.previewSha256 = checksum(previewBytes)
    result.previewPageCount = deliveredPages
    result.validationStatus = 'passed'
    result.generatedAt = new Date().toISOString()
  } catch (error) {
    result.sourceStatus = result.sourceStatus === 'verified' ? 'verified' : 'failed'
    result.generationStatus = result.generationStatus === 'in_progress' ? 'failed' : result.generationStatus
    result.validationStatus = 'failed'
    result.failureCode = /^[A-Z0-9_]{1,80}$/.test(error?.message || '') ? error.message : 'PREVIEW_GENERATION_FAILED'
  }
  completed += 1
  report.updatedAt = new Date().toISOString()
  report.completedCount = completed
  await saveReport(report)
  console.log(JSON.stringify({
    event: 'preview-processed',
    completed,
    total: sourceRows.length,
    paperId: result.paperId,
    revisionCandidate: result.revisionCandidate,
    sourceStatus: result.sourceStatus,
    generationStatus: result.generationStatus,
    validationStatus: result.validationStatus,
    failureCode: result.failureCode || null,
  }))
}

const files = Object.values(report.files)
report.finishedAt = new Date().toISOString()
report.summary = {
  attempted: sourceRows.length,
  passed: files.filter((file) => file.validationStatus === 'passed').length,
  failed: files.filter((file) => file.validationStatus === 'failed').length,
  revisionCandidates: files.filter((file) => file.revisionCandidate).length,
  uploaded: files.filter((file) => file.uploadStatus === 'passed').length,
  pendingUpload: files.filter((file) => file.uploadStatus !== 'passed').length,
}
await saveReport(report)
const coveragePath = path.join(root, 'content', 'knowledge-paper-coverage.json')
const coverage = await readJson(coveragePath, null)
if (coverage) {
  const existingCoverageById = new Map((coverage.papers || []).map((paper) => [paper.id, paper]))
  const filesByPaperId = new Map()
  for (const source of sourceRows) {
    const paperId = source.newPaperId || source.catalogueMatch?.candidateIds?.[0]
    const list = filesByPaperId.get(paperId) || []
    list.push({ source, preview: report.files[source.sha256] })
    filesByPaperId.set(paperId, list)
  }
  coverage.papers = paperCatalog.map((paper) => {
    const previous = existingCoverageById.get(paper.id) || {}
    const candidates = filesByPaperId.get(paper.id) || []
    const canonical = candidates.find(({ source }) => ['exact_match', 'genuinely_new_paper'].includes(source.classification))
    const revisionsForPaper = candidates.filter(({ source }) => source.classification === 'different_edition_or_revision')
    const verified = candidates.some(({ preview }) => preview?.validationStatus === 'passed')
    const status = canonical
      ? 'source-pdf-ready-private-storage-upload-mapping-pending'
      : revisionsForPaper.length
        ? 'source-pdf-found-match-needs-review'
        : 'source-pdf-not-found-in-accessible-sources'
    return {
      ...previous,
      id: paper.id,
      title: paper.title,
      collection: paper.collection,
      country: paper.country || null,
      countryCode: paper.countryCode || null,
      subject: paper.subject || null,
      existingSourceMetadata: previous.existingSourceMetadata || {
        pdfUrl: null,
        storagePath: null,
        fileSize: null,
        coverImage: null,
      },
      status,
      confidentlyMatchedLocalSource: Boolean(canonical),
      previewGeneratorTested: Boolean(verified),
      privateStoragePath: null,
      actualApiPreviewVerified: false,
      sourcePageCount: canonical?.source.pageCount ?? null,
      localPreviewGenerated: Boolean(verified),
      localPreviewGenerationStatus: verified ? 'passed' : 'not_attempted',
      revisionCandidateCount: revisionsForPaper.length,
      sourceCandidates: previous.sourceCandidates || [],
      verifiedLocalSource: previous.verifiedLocalSource || null,
      sourceSearchNote: previous.sourceSearchNote || null,
    }
  })
  coverage.catalogueCount = paperCatalog.length
  coverage.generatedAt = new Date().toISOString()
  coverage.statusCounts = Object.fromEntries([...new Set(coverage.papers.map((paper) => paper.status))]
    .map((status) => [status, coverage.papers.filter((paper) => paper.status === status).length]))
  coverage.sourceFilesAuditedLocally = inventory.pdfCount
  coverage.archivePreviewGeneration = {
    attemptedCount: sourceRows.length,
    passedCount: files.filter((file) => file.validationStatus === 'passed').length,
    failedCount: files.filter((file) => file.validationStatus === 'failed').length,
    revisionCandidateCount: files.filter((file) => file.revisionCandidate).length,
    maximumPreviewPages: PREVIEW_PAGE_LIMIT,
    uploadedCount: files.filter((file) => file.uploadStatus === 'passed').length,
    note: 'Previews are locally generated, reopened, and page-count validated. Storage upload and live API serving remain separate statuses.',
  }
  coverage.caveats = [...new Set([
    ...(coverage.caveats || []),
    'Archive previews are generated locally only; no preview objects were uploaded or made publicly accessible.',
  ])]
  const coverageTemporary = `${coveragePath}.partial-${process.pid}-${randomUUID()}`
  await writeFile(coverageTemporary, `${JSON.stringify(coverage, null, 2)}\n`, { mode: 0o600 })
  await rename(coverageTemporary, coveragePath)
}
console.log(JSON.stringify({ event: 'preview-generation-complete', ...report.summary }))
