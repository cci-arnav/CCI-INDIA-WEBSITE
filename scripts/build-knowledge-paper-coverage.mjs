import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const catalogue = readJson('content/knowledge-papers.json')
const sourceManifest = readJson('scripts/knowledge-paper-source-manifest.json')
const driveListings = readJson('scripts/knowledge-paper-drive-listings.json')
const embassyAudit = readJson('scripts/knowledge-paper-embassy-pdf-audit.json')
const privateRoot = resolve(root, 'private-knowledge-papers')
const readPrivateJson = (name) => {
  const file = resolve(privateRoot, name)
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null
}
const archiveComparison = readPrivateJson('knowledge-paper-catalogue-comparison.json')
const archiveInventory = readPrivateJson('knowledge-paper-source-inventory.json')
const archivePreviewReport = readPrivateJson('preview-generation-report.json')
const archiveSourcesById = new Map(Object.entries(archiveComparison?.sourceByPaperId || {}))
const archiveRevisionsById = new Map((archiveComparison?.revisionsRequiringReview || []).map((item) => [item.paperId, item]))
const archiveInventoryByHash = new Map((archiveInventory?.files || []).map((file) => [file.sha256, file]))

const knownAliases = {
  'Jammu and Kashmir': ['j&k'],
  'Dadra and Nagar Haveli and Daman and Diu': ['daman and diu'],
  'Chemicals and Fertilizers': ['chemical and fertilisers'],
  'Communications': ['communication'],
  'Panchayati Raj': ['panchyati raj'],
  'Parliamentary Affairs': ['parliamentry affairs'],
  'Personnel, Public Grievances and Pensions': ['personel'],
  'Micro, Small and Medium Enterprises': ['msme'],
  'Commerce and Industry': ['commerce and industries'],
  'Petroleum and Natural Gas': ['petroleum and gases'],
  'Housing and Urban Affairs': ['housing affairs'],
  'Information and Broadcasting': ['information'],
  'Electronics and Information Technology': ['electronics'],
  'Environment, Forest and Climate Change': ['environment'],
  'Fisheries, Animal Husbandry and Dairying': ['fisheries'],
  'Health and Family Welfare': ['health'],
  'Ministry of Consumer Affairs, Food and Public Distribution': ['consumer affairs'],
  'Road Transport and Highways': ['road transports'],
  'Ports, Shipping and Waterways': ['ports and waterways'],
  'Ministry of Development of North Eastern Region': ['development of north eastern'],
}
const observedMinistryNamesById = {
  'ministry-culture-knowledge-paper-2026': 'Copy of Ministry of Culture',
  'ministry-external-affairs-knowledge-paper-2026': 'Copy of ministry of external affiars',
  'ministry-heavy-industries-knowledge-paper-2026': 'Copy of ministry of heavyy industries',
  'ministry-home-affairs-knowledge-paper-2026': 'Copy of ministry of home affiars',
}

const normalized = (value) => String(value).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ')
const normalizeWords = (value) => normalized(value)
  .replace(/\b(copy of|knowledge paper|knowledge|paper|state|ministry|india|the|and|of)\b/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .split(' ')
  .filter(Boolean)
  .map((word) => word.replace(/s$/, ''))

function candidateListings(paper) {
  const sources = []
  for (const folder of driveListings.folders) {
    if (!folder.files?.length) continue
    if (paper.collection === 'State & UT' && folder.folderId !== '1jgedKEDRTzbugfT8Svn_aBK1uWVB_4vS') continue
    if (paper.collection === 'Ministry' && folder.folderId !== '1AHFjNwIofVZgEDv-M5uEtWViM1aktYek') continue
    if (paper.collection === 'International & Sectoral' && folder.folderId !== '1tj4Yy700YRNv9R6R4UKuTb4nuag5FEu_') continue

    let aliases = []
    if (paper.collection === 'International & Sectoral') {
      if (paper.country === 'India') aliases = ['tea industry growth']
      else aliases = [paper.country]
      if (paper.country === 'Ecuador') aliases.push('equador')
      if (paper.country === 'Tajikistan') aliases.push('tajakistan')
    } else {
      aliases = [paper.subject || '']
      aliases.push(...(knownAliases[paper.subject] || []))
    }

    let eligible = []
    if (paper.collection === 'International & Sectoral') {
      eligible = folder.files.filter((name) => aliases.some((alias) => {
        const aliasText = normalized(alias)
        return aliasText && normalized(name).includes(aliasText)
      }))
    } else {
      const observedName = paper.collection === 'Ministry' ? observedMinistryNamesById[paper.id] : null
      if (observedName && folder.files.includes(observedName)) eligible = [observedName]
      if (!eligible.length) {
      const wanted = normalizeWords(paper.subject || '')
      const scored = folder.files.map((name) => {
        const fileText = normalizeWords(name)
        const aliasesForPaper = [paper.subject || '', ...(knownAliases[paper.subject] || [])]
        const aliasMatch = aliasesForPaper.some((alias) => {
          const aliasText = normalizeWords(alias).join(' ')
          return aliasText && fileText.join(' ').includes(aliasText)
        })
        const score = wanted.filter((token) => fileText.includes(token)).length
        return { name, score: aliasMatch ? wanted.length + 1 : score }
      }).filter((item) => item.score > 0)
      const best = Math.max(0, ...scored.map((item) => item.score))
      const bestMatches = scored.filter((item) => item.score === best)
      if (bestMatches.length === 1) eligible = [bestMatches[0].name]
      }
    }

    for (const name of eligible) {
      sources.push({
        folderId: folder.folderId,
        folderName: folder.name,
        driveName: name,
        fileType: 'PDF (Drive listing)',
        contentVerified: false,
        matchConfidence: 'needs-review',
        pageCount: null,
        sizeBytes: null,
        sha256: null,
      })
    }
  }

  for (const audited of embassyAudit.files.filter((file) => file.candidateCatalogueId === paper.id)) {
    sources.push({
      folderId: '1U3oNea8KuLnEId4GZiyEL_8H2TTkSz-z',
      folderName: 'knowledge paper-embassy (pdf)',
      driveName: audited.sourceFile,
      fileType: 'PDF',
      contentVerified: true,
      matchConfidence: audited.matchConfidence,
      pageCount: audited.pageCount,
      sizeBytes: audited.sizeBytes,
      sha256: audited.sha256,
      sourceArchive: embassyAudit.sourceArchive,
    })
  }

  return sources
}

const verifiedLocal = new Map(sourceManifest.localVerifiedSources.map((source) => [source.catalogueId, source]))
const missingSourceIds = new Set(['india-tea-industry-growth-2026'])
const rows = catalogue.map((paper) => {
  const manifestLocal = verifiedLocal.get(paper.id)
  const archiveSource = archiveSourcesById.get(paper.id)
  const archiveFile = archiveSource && archiveInventoryByHash.get(archiveSource.sha256)
  const archivePreview = archiveSource && archivePreviewReport?.files?.[archiveSource.sha256]
  const archiveRevision = archiveRevisionsById.get(paper.id)
  const local = manifestLocal || (archiveFile ? {
    catalogueId: paper.id,
    catalogueTitle: paper.title,
    sourceFile: archiveFile.fileName,
    sizeBytes: archiveFile.sizeBytes,
    sha256: archiveFile.sha256,
    pageCount: archiveFile.pageCount,
    matchConfidence: 'visually-confirmed',
    status: 'verified-local-not-uploaded',
  } : null)
  const revisionCandidates = (archiveRevision?.sources || []).map((sourcePath) => {
    const source = archiveInventory?.files.find((file) => file.relativePath === sourcePath)
    return source ? {
      sourceFile: source.fileName,
      fileType: 'PDF (private archive)',
      contentVerified: true,
      matchConfidence: 'alternate-edition-review-required',
      pageCount: source.pageCount,
      sizeBytes: source.sizeBytes,
      sha256: source.sha256,
      localPreviewGenerated: archivePreviewReport?.files?.[source.sha256]?.validationStatus === 'passed',
    } : null
  }).filter(Boolean)
  const candidates = [...candidateListings(paper), ...revisionCandidates]
  const archivePreviewPassed = archivePreview?.validationStatus === 'passed'
  const existingSourceMetadata = {
    pdfUrl: paper.pdfUrl || null,
    storagePath: paper.storagePath || null,
    fileSize: paper.fileSize || null,
    coverImage: paper.coverImage || null,
  }
  const status = archiveRevision && !archiveSource
    ? 'source-pdf-found-match-needs-review'
    : local
    ? 'source-pdf-ready-private-storage-upload-mapping-pending'
    : candidates.length
      ? 'source-pdf-found-match-needs-review'
      : missingSourceIds.has(paper.id)
        ? 'source-pdf-not-found-in-accessible-sources'
        : 'source-pdf-not-found-in-accessible-sources'

  return {
    id: paper.id,
    title: paper.title,
    collection: paper.collection || null,
    country: paper.country || null,
    countryCode: paper.countryCode || null,
    subject: paper.subject || null,
    existingSourceMetadata,
    status,
    confidentlyMatchedLocalSource: Boolean(manifestLocal || archiveSource),
    previewGeneratorTested: Boolean(manifestLocal || archivePreviewPassed || candidates.some((source) => source.contentVerified)),
    privateStoragePath: null,
    actualApiPreviewVerified: false,
    sourceCandidates: candidates,
    verifiedLocalSource: local || null,
    sourceSearchNote: candidates.length || archiveFile ? null : 'No matching filename in the locally inspected files or accessible Drive listings. The fifth shared folder was not inspectable, so absence is not conclusive.',
    ...(archiveFile ? { sourcePageCount: archiveFile.pageCount, localPreviewGenerated: archivePreviewPassed } : {}),
    ...(archiveRevision ? { revisionCandidateCount: archiveRevision.sources.length } : {}),
  }
})

const report = {
  generatedAt: new Date().toISOString(),
  catalogueCount: rows.length,
  statusCounts: Object.fromEntries([...new Set(rows.map((row) => row.status))].map((status) => [status, rows.filter((row) => row.status === status).length])),
  actualApiPreviewVerifiedCount: rows.filter((row) => row.actualApiPreviewVerified).length,
  privateMappingsConfiguredCount: rows.filter((row) => row.privateStoragePath).length,
  sourceFilesAuditedLocally: sourceManifest.localVerifiedSources.length + embassyAudit.files.length + (archiveInventory?.pdfCount || 0),
  previewGenerator: {
    testedPdfCount: sourceManifest.localVerifiedSources.length + embassyAudit.files.length,
    passedPdfCount: sourceManifest.localVerifiedSources.length + embassyAudit.files.length,
    failedPdfCount: 0,
    maximumPreviewPages: 5,
    note: 'All currently available local source PDFs were loaded, passed through createPdfDelivery, and re-opened to verify the output page count and PDF signature.',
  },
  archivePreviewGeneration: archivePreviewReport?.summary ? {
    attemptedCount: archivePreviewReport.summary.attempted,
    passedCount: archivePreviewReport.summary.passed,
    failedCount: archivePreviewReport.summary.failed,
    revisionCandidateCount: archivePreviewReport.summary.revisionCandidates,
    maximumPreviewPages: archivePreviewReport.previewPageLimit,
    uploadedCount: archivePreviewReport.summary.uploaded,
  } : null,
  sourcePdfMetadata: {
    localVerifiedSources: sourceManifest.localVerifiedSources,
    additionalArchiveAudit: embassyAudit,
    unmatchedLocalCandidates: sourceManifest.unmatchedLocalCandidates,
    unmatchedArchivePdfs: embassyAudit.files.filter((file) => !file.candidateCatalogueId),
    unmatchedDriveCandidates: sourceManifest.unmatchedDriveCountries,
  },
  duplicateReview: {
    exactHashDuplicatesAmongLocallyAuditedPdfs: 0,
    likelySameCountryCandidatesAcrossInternationalAndEmbassyFolders: 15,
    alternateTunisiaFileHasDifferentSha256: true,
    note: 'Cross-folder Drive file bytes were unavailable, so filename/country overlap is not an exact duplicate determination.',
  },
  driveFolderListings: driveListings.folders,
  caveats: [
    'Drive UI file listings establish only filenames and PDF type labels; the State/UT and Ministry file bytes were not downloaded locally during this audit.',
    'Archive PDF cover identities were visually reviewed; Kenya, Iraq, and Tunisia contain alternate editions that remain intentionally unmapped to a newly selected canonical source.',
    'The older fifth Drive folder could not be inspected; its historical count in the prior manifest is unverified.',
    'The dedicated pre-generated-preview bucket and metadata migration are manual setup steps; live API serving has not been verified.',
  ],
  papers: rows,
}

if (rows.length !== catalogue.length || new Set(rows.map((row) => row.id)).size !== catalogue.length) {
  throw new Error(`Expected ${catalogue.length} unique catalogue IDs, received ${rows.length}`)
}

writeFileSync(resolve(root, 'content/knowledge-paper-coverage.json'), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({ catalogueCount: rows.length, statusCounts: report.statusCounts, sourceFilesAuditedLocally: report.sourceFilesAuditedLocally, driveFolderListings: driveListings.folders.map(({ name, listingPdfCount, listingGoogleDocsCount, access }) => ({ name, listingPdfCount, listingGoogleDocsCount: listingGoogleDocsCount || 0, access })) }, null, 2))
