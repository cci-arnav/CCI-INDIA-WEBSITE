import { existsSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import 'pdfjs-dist/legacy/build/pdf.worker.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const privateRoot = path.join(root, 'private-knowledge-papers')
const extractedRoot = path.join(privateRoot, 'extracted')
const extractionManifestPath = path.join(privateRoot, 'extraction-manifest.json')
const inventoryPath = path.join(privateRoot, 'knowledge-paper-source-inventory.json')
const comparisonPath = path.join(privateRoot, 'knowledge-paper-catalogue-comparison.json')
const checkpointPath = path.join(privateRoot, 'inventory-checkpoint.json')
const catalogue = JSON.parse(await readFile(path.join(root, 'content', 'knowledge-papers.json'), 'utf8'))
const coveragePath = path.join(root, 'content', 'knowledge-paper-coverage.json')
const coverage = existsSync(coveragePath) ? JSON.parse(await readFile(coveragePath, 'utf8')) : {}
const extraction = JSON.parse(await readFile(extractionManifestPath, 'utf8'))
const identityReviewPath = path.join(privateRoot, 'source-identity-review.json')

const normalize = (value) => String(value || '')
  .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/\.pdf$/i, '').replace(/[^a-z0-9]+/g, '')
const normalizeWords = (value) => String(value || '')
  .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/\.pdf$/i, '').replace(/\band\b|&/gi, ' ')
  .replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ')
const safeReadJson = async (file) => {
  try { return JSON.parse(await readFile(file, 'utf8')) } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) return null
    throw error
  }
}
const identityReview = await safeReadJson(identityReviewPath) || { catalogueMatches: [], newPapers: [] }
let writeQueue = Promise.resolve()
const atomicWrite = (file, value) => {
  const operation = writeQueue.catch(() => {}).then(async () => {
    const temporary = `${file}.partial-${process.pid}-${randomUUID()}`
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 })
    const { rename } = await import('node:fs/promises')
    await rename(temporary, file)
  })
  writeQueue = operation
  return operation
}
const collectionForArchive = (name) => {
  const normalized = normalize(name)
  if (normalized.includes('state')) return 'State & UT'
  if (normalized.includes('ministr')) return 'Ministry'
  if (normalized.includes('embassy')) return 'International & Sectoral'
  return null
}
const coreForPaper = (paper) => {
  if (paper.collection === 'Ministry') return paper.title.replace(/^Ministry of\s+/i, '').replace(/:\s*Knowledge Paper$/i, '')
  if (paper.collection === 'State & UT') return paper.title.replace(/:\s*State Knowledge Paper$/i, '')
  return paper.title.replace(/^India\s*&\s*/i, '').split(':')[0]
}
const sourceManifest = await safeReadJson(path.join(root, 'scripts', 'knowledge-paper-source-manifest.json'))
const knownSourceRecords = [
  ...(sourceManifest?.localVerifiedSources || []),
  ...(coverage?.sourcePdfMetadata?.localVerifiedSources || []),
  ...(coverage?.sourcePdfMetadata?.additionalArchiveAudit?.files || []),
]
const manifestMatchByHash = new Map()
for (const source of knownSourceRecords) {
  const catalogueId = source.catalogueId || source.candidateCatalogueId
  if (source.sha256 && catalogueId && catalogue.some((paper) => paper.id === catalogueId)) {
    const records = manifestMatchByHash.get(source.sha256) || []
    records.push({ ...source, catalogueId })
    manifestMatchByHash.set(source.sha256, records)
  }
}
const savedCheckpoint = await safeReadJson(checkpointPath)
const savedInventory = await safeReadJson(inventoryPath)
const previous = (savedInventory?.files?.length || 0) > (savedCheckpoint?.rows?.length || 0)
  ? { rows: savedInventory.files }
  : savedCheckpoint || { rows: [] }
const previousByPath = new Map((previous.rows || []).filter((row) => row?.relativePath).map((row) => [row.relativePath, row]))
const sourceFiles = extraction.archives.flatMap((archive) => (archive.files || [])
  .filter((file) => /\.pdf$/i.test(file.relativePath))
  .map((file) => ({
    archive: archive.name,
    archiveStatus: archive.status,
    extractionDirectory: archive.directory,
    ...file,
  })))
const rows = new Array(sourceFiles.length)
let nextIndex = 0
let completedSinceCheckpoint = 0

async function inspectPdf(source) {
  const relativePath = `${source.archive}/${source.originalPath || source.relativePath}`
  const cached = previousByPath.get(relativePath)
  if (cached?.sha256 === source.sha256
    && ['valid', 'invalid', 'encrypted'].includes(cached?.parseStatus)) return cached

  const row = {
    archive: source.archive,
    relativePath,
    extractedPath: path.posix.join(source.extractionDirectory, source.relativePath),
    fileName: path.posix.basename(source.originalPath || source.relativePath),
    sizeBytes: source.sizeBytes,
    sha256: source.sha256,
    signatureValid: false,
    parseStatus: 'pending',
    pageCount: null,
    encrypted: false,
    metadata: { title: null, author: null, subject: null, creator: null },
    firstPageText: '',
    catalogueMatch: { status: 'unmatched', candidateIds: [], confidence: 'none', evidence: [] },
    duplicateOf: null,
    classification: 'unidentified',
    failureCode: null,
  }
  const filePath = path.join(extractedRoot, source.extractionDirectory, ...source.relativePath.split('/'))
  try {
    const bytes = await readFile(filePath)
    if (bytes.byteLength !== source.sizeBytes) throw Object.assign(new Error('SOURCE_SIZE_MISMATCH'), { code: 'SOURCE_SIZE_MISMATCH' })
    row.signatureValid = new TextDecoder().decode(bytes.subarray(0, 5)) === '%PDF-'
    if (!row.signatureValid) {
      row.parseStatus = 'invalid'
      row.classification = 'invalid_or_unrelated'
      row.failureCode = 'INVALID_PDF_SIGNATURE'
      return row
    }
    const task = getDocument({ data: new Uint8Array(bytes), stopAtErrors: true, useSystemFonts: true, verbosity: 0 })
    try {
      const document = await task.promise
      row.pageCount = document.numPages
      const metadata = await document.getMetadata()
      const info = metadata?.info || {}
      row.metadata = {
        title: typeof info.Title === 'string' ? info.Title.slice(0, 300) : null,
        author: typeof info.Author === 'string' ? info.Author.slice(0, 200) : null,
        subject: typeof info.Subject === 'string' ? info.Subject.slice(0, 300) : null,
        creator: typeof info.Creator === 'string' ? info.Creator.slice(0, 200) : null,
      }
      if (document.numPages > 0) {
        const firstPage = await document.getPage(1)
        const content = await firstPage.getTextContent()
        row.firstPageText = content.items.map((item) => item.str).join(' ').replace(/\s+/g, ' ').trim().slice(0, 800)
        firstPage.cleanup()
      }
      row.parseStatus = 'valid'
    } finally {
      await task.destroy().catch(() => {})
    }
  } catch (error) {
    row.encrypted = /password/i.test(`${error?.name || ''} ${error?.message || ''}`)
    row.parseStatus = row.encrypted ? 'encrypted' : 'unreadable'
    row.classification = 'invalid_or_unrelated'
    row.failureCode = row.encrypted ? 'PDF_PASSWORD_REQUIRED' : 'PDF_PARSE_FAILED'
  }
  return row
}

const workers = Array.from({ length: 2 }, async () => {
  while (true) {
    const index = nextIndex
    nextIndex += 1
    if (index >= sourceFiles.length) return
    rows[index] = await inspectPdf(sourceFiles[index])
    completedSinceCheckpoint += 1
    if (completedSinceCheckpoint >= 5) {
      completedSinceCheckpoint = 0
      await atomicWrite(checkpointPath, { updatedAt: new Date().toISOString(), rows: rows.filter(Boolean) })
    }
    console.log(JSON.stringify({ event: 'pdf-inspected', completed: rows.filter(Boolean).length, total: sourceFiles.length, relativePath: rows[index].relativePath, parseStatus: rows[index].parseStatus }))
  }
})
await Promise.all(workers)

const duplicateGroups = new Map()
for (const row of rows) {
  const group = duplicateGroups.get(row.sha256) || []
  group.push(row)
  duplicateGroups.set(row.sha256, group)
}
for (const group of duplicateGroups.values()) {
  if (group.length > 1) for (const row of group.slice(1)) {
    row.duplicateOf = group[0].relativePath
    row.classification = 'duplicate_file'
  }
}

const catalogueById = new Map(catalogue.map((paper) => [paper.id, paper]))
const manualMatchesByHash = new Map()
const newPapersByHash = new Map()
for (const match of identityReview.catalogueMatches || []) {
  if (!/^[a-f0-9]{64}$/.test(match.sha256 || '') || !catalogueById.has(match.paperId)) {
    throw new Error(`Invalid visual identity review mapping for paper ${match.paperId || '(missing id)'}.`)
  }
  manualMatchesByHash.set(match.sha256, match)
}
for (const paper of identityReview.newPapers || []) {
  if (!/^[a-f0-9]{64}$/.test(paper.sha256 || '') || !catalogueById.has(paper.id)) {
    throw new Error(`Invalid visually reviewed new-paper mapping for ${paper.id || '(missing id)'}.`)
  }
  newPapersByHash.set(paper.sha256, paper)
}
for (const row of rows) {
  if (row.classification === 'duplicate_file' || row.parseStatus !== 'valid') continue
  const known = manifestMatchByHash.get(row.sha256) || []
  const knownIds = [...new Set(known.map((item) => item.catalogueId))]
  if (knownIds.length === 1) {
    row.catalogueMatch = {
      status: 'exact_match',
      candidateIds: knownIds,
      confidence: 'high',
      evidence: ['source_sha256_matches_verified_source_manifest'],
    }
    row.classification = 'exact_match'
    continue
  }
  const collection = collectionForArchive(row.archive)
  const filename = normalizeWords(row.fileName)
  const firstPage = normalizeWords(row.firstPageText)
  const metaTitle = normalizeWords(row.metadata.title)
  const candidates = []
  for (const paper of catalogue.filter((item) => !collection || item.collection === collection)) {
    const title = normalizeWords(paper.title)
    const core = normalizeWords(coreForPaper(paper))
    const fileSignal = core.length >= 3 && ` ${filename} `.includes(` ${core} `)
    const titleSignal = title.length >= 12 && (firstPage.includes(title) || metaTitle.includes(title))
    let coreTextSignal = core.length >= 3 && (firstPage.includes(core) || metaTitle.includes(core))
    if (paper.collection === 'Ministry' && core.split(' ').length === 1) {
      const ministryName = `ministry of ${core}`
      coreTextSignal = titleSignal || firstPage.includes(ministryName) || metaTitle.includes(ministryName)
    }
    if (titleSignal || coreTextSignal || fileSignal) candidates.push({
      paper,
      score: titleSignal ? 100 : coreTextSignal && fileSignal ? 90 : coreTextSignal ? 80 : 50,
      evidence: [
        ...(titleSignal ? ['pdf_title_or_first_page_contains_catalogue_title'] : []),
        ...(coreTextSignal ? ['pdf_title_or_first_page_contains_subject'] : []),
        ...(fileSignal ? ['filename_contains_catalogue_subject'] : []),
      ],
    })
  }
  candidates.sort((a, b) => b.score - a.score)
  const bestScore = candidates[0]?.score
  const best = candidates.filter((candidate) => candidate.score === bestScore)
  if (best.length) {
    const ids = best.map((candidate) => candidate.paper.id)
    const exact = best.length === 1 && (bestScore >= 80 || knownIds.length === 1)
    row.catalogueMatch = {
      status: exact ? 'exact_match' : 'likely_match',
      candidateIds: ids,
      confidence: exact ? 'high' : 'medium',
      evidence: [...new Set(best.flatMap((candidate) => candidate.evidence))],
      ...(best.length > 1 ? { reviewRequired: true } : {}),
    }
    row.classification = exact ? 'exact_match' : 'likely_match_needing_review'
  } else {
    row.classification = 'unmatched_valid_pdf_review'
    row.catalogueMatch = { status: 'unmatched', candidateIds: [], confidence: 'none', evidence: ['no_catalogue_identity_confirmed'] }
  }
}

const inventoriedHashes = new Set(rows.filter((row) => row.parseStatus === 'valid').map((row) => row.sha256))
for (const sha256 of [...manualMatchesByHash.keys(), ...newPapersByHash.keys()]) {
  if (!inventoriedHashes.has(sha256)) throw new Error(`Visual identity review checksum is not present in the valid PDF inventory: ${sha256}`)
}
for (const row of rows) {
  if (row.classification === 'duplicate_file' || row.parseStatus !== 'valid') continue
  const manualMatch = manualMatchesByHash.get(row.sha256)
  if (manualMatch) {
    row.catalogueMatch = {
      status: 'exact_match',
      candidateIds: [manualMatch.paperId],
      confidence: 'high',
      evidence: ['human_visual_cover_review_verified_title_and_country'],
    }
    row.classification = 'exact_match'
    row.identityReview = 'visual_cover_review'
    continue
  }
  const newPaper = newPapersByHash.get(row.sha256)
  if (newPaper) {
    row.catalogueMatch = {
      status: 'new_paper',
      candidateIds: [],
      confidence: 'high',
      evidence: ['human_visual_cover_review_confirmed_new_bilateral_paper'],
    }
    row.classification = 'genuinely_new_paper'
    row.identityReview = 'visual_cover_review'
    row.newPaperId = newPaper.id
  }
}

const matchedHashesById = new Map()
for (const row of rows) {
  if (row.catalogueMatch.candidateIds.length === 1 && row.classification === 'exact_match') {
    const id = row.catalogueMatch.candidateIds[0]
    const group = matchedHashesById.get(id) || []
    group.push(row)
    matchedHashesById.set(id, group)
  }
}
const revisions = []
for (const [paperId, matchingRows] of matchedHashesById) {
  if (new Set(matchingRows.map((row) => row.sha256)).size > 1) {
    for (const row of matchingRows) {
      row.classification = 'different_edition_or_revision'
      row.catalogueMatch.status = 'likely_match'
      row.catalogueMatch.reviewRequired = true
    }
    revisions.push({ paperId, sources: matchingRows.map((row) => row.relativePath) })
  }
}

for (const row of rows) {
  if (row.classification === 'exact_match' && !catalogueById.has(row.catalogueMatch.candidateIds[0])) {
    row.classification = 'unmatched_valid_pdf_review'
    row.catalogueMatch = { status: 'unmatched', candidateIds: [], confidence: 'none', evidence: ['invalid_catalogue_mapping'] }
  }
}

const inventory = {
  generatedAt: new Date().toISOString(),
  archiveCount: extraction.archiveCount,
  processedArchiveCount: extraction.successfullyProcessed,
  pdfCount: rows.length,
  uniquePdfCount: duplicateGroups.size,
  duplicateFileCount: rows.filter((row) => row.duplicateOf).length,
  validPdfCount: rows.filter((row) => row.parseStatus === 'valid').length,
  encryptedPdfCount: rows.filter((row) => row.encrypted).length,
  unreadablePdfCount: rows.filter((row) => ['unreadable', 'invalid'].includes(row.parseStatus)).length,
  catalogueCount: catalogue.length,
  files: rows,
}
const comparison = {
  generatedAt: inventory.generatedAt,
  originalCatalogueCount: identityReview.preImportCatalogueCount ?? catalogue.length,
  catalogueCount: catalogue.length,
  sourcePdfCount: rows.length,
  exactMatches: rows.filter((row) => row.classification === 'exact_match').map((row) => ({
    paperId: row.catalogueMatch.candidateIds[0],
    catalogueTitle: catalogueById.get(row.catalogueMatch.candidateIds[0])?.title,
    source: row.relativePath,
    sha256: row.sha256,
    pageCount: row.pageCount,
    evidence: row.catalogueMatch.evidence,
    confidence: row.catalogueMatch.confidence,
    reviewStatus: 'matched',
  })),
  likelyMatchesRequiringReview: rows.filter((row) => row.classification === 'likely_match_needing_review' || row.classification === 'different_edition_or_revision')
    .map((row) => ({ source: row.relativePath, candidates: row.catalogueMatch.candidateIds, evidence: row.catalogueMatch.evidence, confidence: row.catalogueMatch.confidence, status: row.classification })),
  duplicates: rows.filter((row) => row.duplicateOf).map((row) => ({ source: row.relativePath, duplicateOf: row.duplicateOf, sha256: row.sha256 })),
  revisionsRequiringReview: revisions,
  unmatchedValidFilesRequiringReview: rows.filter((row) => row.classification === 'unmatched_valid_pdf_review').map((row) => ({
    source: row.relativePath,
    fileName: row.fileName,
    metadataTitle: row.metadata.title,
    firstPageText: row.firstPageText.slice(0, 300),
    sha256: row.sha256,
    pageCount: row.pageCount,
    status: 'identity_not_confirmed',
  })),
  invalidOrUnreadable: rows.filter((row) => row.classification === 'invalid_or_unrelated').map((row) => ({
    source: row.relativePath,
    sizeBytes: row.sizeBytes,
    sha256: row.sha256,
    parseStatus: row.parseStatus,
    failureCode: row.failureCode,
  })),
  confidentNewPapers: rows.filter((row) => row.classification === 'genuinely_new_paper').map((row) => {
    const paper = newPapersByHash.get(row.sha256)
    return {
      id: paper.id,
      title: paper.title,
      country: paper.country,
      countryCode: paper.countryCode,
      year: 2026,
      collection: 'International & Sectoral',
      pageCount: row.pageCount,
      source: row.relativePath,
      sha256: row.sha256,
      identityReview: 'visually_confirmed_cover',
    }
  }),
  entriesAdded: rows.filter((row) => row.classification === 'genuinely_new_paper').length,
  finalCatalogueCount: catalogue.length,
  revisionSources: rows.filter((row) => row.classification === 'different_edition_or_revision').map((row) => ({
    paperId: row.catalogueMatch.candidateIds[0],
    source: row.relativePath,
    sha256: row.sha256,
    pageCount: row.pageCount,
  })),
  sourceByPaperId: Object.fromEntries(comparisonSafeSourceRows(rows, newPapersByHash)),
}
function* comparisonSafeSourceRows(paperRows, reviewedNewPapers) {
  for (const row of paperRows) {
    if (row.classification === 'exact_match') {
      yield [row.catalogueMatch.candidateIds[0], { source: row.relativePath, sha256: row.sha256, pageCount: row.pageCount }]
    } else if (row.classification === 'genuinely_new_paper') {
      yield [reviewedNewPapers.get(row.sha256).id, { source: row.relativePath, sha256: row.sha256, pageCount: row.pageCount }]
    }
  }
}

await atomicWrite(inventoryPath, inventory)
await atomicWrite(comparisonPath, comparison)
await atomicWrite(checkpointPath, { updatedAt: new Date().toISOString(), rows })
console.log(JSON.stringify({
  event: 'inventory-complete',
  archiveCount: inventory.archiveCount,
  processedArchiveCount: inventory.processedArchiveCount,
  pdfCount: inventory.pdfCount,
  uniquePdfCount: inventory.uniquePdfCount,
  duplicateFileCount: inventory.duplicateFileCount,
  validPdfCount: inventory.validPdfCount,
  unreadablePdfCount: inventory.unreadablePdfCount,
  catalogueCount: catalogue.length,
  exactMatches: comparison.exactMatches.length,
  likelyMatchesRequiringReview: comparison.likelyMatchesRequiringReview.length,
  unmatchedValidFilesRequiringReview: comparison.unmatchedValidFilesRequiringReview.length,
  invalidOrUnreadable: comparison.invalidOrUnreadable.length,
}))
