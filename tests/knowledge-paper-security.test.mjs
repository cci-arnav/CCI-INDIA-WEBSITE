import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { PDFDocument } from 'pdf-lib'
import { isMissingRegistrySchema, isMissingStorageObject, isRegistryPermissionError, isStoragePermissionError, isStorageTimeoutError } from '../api/knowledge-papers/[id].js'
import { createPdfDelivery, isPublicPreviewMode } from '../src/lib/knowledgePaperPdfDelivery.js'
import { getKnowledgePaperRequestUrl } from '../src/lib/knowledgePapers.js'
import { readKnowledgePaperPreview } from '../src/lib/knowledgePaperPreview.js'
import { createPrivatePdfPreview, getPreviewFailureDiagnostic } from '../src/lib/knowledgePaperRangePreview.js'

const repoFile = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8')

const makePdf = async (pages) => {
  const pdf = await PDFDocument.create()
  for (let index = 0; index < pages; index += 1) pdf.addPage([612, 792])
  return pdf.save()
}

const rangeFetcher = (source, rangeCalls = []) => async (_url, init) => {
  if (init.method === 'HEAD') {
    return new Response(null, { status: 200, headers: { 'Accept-Ranges': 'bytes', 'Content-Length': String(source.length) } })
  }
  const [begin, end] = init.headers.Range.match(/bytes=(\d+)-(\d+)/).slice(1).map(Number)
  rangeCalls.push([begin, end])
  const chunk = source.slice(begin, end + 1)
  return new Response(chunk, {
    status: 206,
    headers: {
      'Accept-Ranges': 'bytes',
      'Content-Length': String(chunk.length),
      'Content-Range': `bytes ${begin}-${end}/${source.length}`,
      'Content-Type': 'application/pdf',
    },
  })
}

test('public previews never exceed five pages, even if a larger limit is supplied', async () => {
  const result = await createPdfDelivery(await makePdf(8), 100)
  const delivered = await PDFDocument.load(result.bytes)
  assert.equal(result.pageCount, 8)
  assert.equal(result.deliveredPages, 5)
  assert.equal(delivered.getPageCount(), 5)
})

test('short papers are delivered in full within the preview limit', async () => {
  const result = await createPdfDelivery(await makePdf(3), 5)
  const delivered = await PDFDocument.load(result.bytes)
  assert.equal(result.pageCount, 3)
  assert.equal(result.deliveredPages, 3)
  assert.equal(delivered.getPageCount(), 3)
})

test('invalid source documents fail preview generation instead of falling back to source bytes', async () => {
  await assert.rejects(createPdfDelivery(new Uint8Array([1, 2, 3, 4])))
})

test('public endpoint accepts preview mode only and does not expose full-document mode', () => {
  assert.equal(isPublicPreviewMode(undefined), true)
  assert.equal(isPublicPreviewMode('preview'), true)
  assert.equal(isPublicPreviewMode('full'), false)
  assert.equal(isPublicPreviewMode('access'), false)
  const endpoint = repoFile('../api/knowledge-papers/[id].js')
  assert.match(endpoint, /if \(!isPublicPreviewMode\(mode\)\)/)
  assert.match(endpoint, /createPrivatePdfPreview\(/)
  assert.doesNotMatch(endpoint, /\.storage\.from\([^\n]+\)\.download\(/)
  assert.doesNotMatch(endpoint, /knowledge_paper_access/)
  assert.doesNotMatch(endpoint, /mode === ['"]full['"]/)
})

test('a missing or inactive private registry mapping fails safely without returning a source PDF', () => {
  const endpoint = repoFile('../api/knowledge-papers/[id].js')
  assert.match(endpoint, /if \(!paper\) return error\(res, 404, 'REGISTRY_MAPPING_MISSING'/)
  assert.match(endpoint, /if \(!paper\.active\) return error\(res, 404, 'PAPER_INACTIVE'/)
  assert.match(endpoint, /bucket: 'knowledge-papers-private'/)
  assert.match(endpoint, /storagePath: paper\.storage_path/)
  assert.doesNotMatch(endpoint, /\.createSignedUrl\(|\.getPublicUrl\(/)
})

test('private range transport emits a five-page PDF and limits each origin read to a byte range', async () => {
  const source = await makePdf(8)
  const padded = source
  const rangeCalls = []
  const result = await createPrivatePdfPreview({
    supabaseUrl: 'https://example.supabase.co',
    serviceRoleKey: 'server-only-test-key',
    bucket: 'knowledge-papers-private',
    storagePath: 'papers/test/original.pdf',
    fetchImpl: rangeFetcher(padded, rangeCalls),
  })
  const delivered = await PDFDocument.load(result.bytes)
  assert.equal(result.pageCount, 8)
  assert.equal(result.deliveredPages, 5)
  assert.equal(delivered.getPageCount(), 5)
  assert.ok(rangeCalls.length > 0)
  assert.ok(result.transferredBytes <= padded.length)
  assert.ok(rangeCalls.every(([begin, end]) => end - begin + 1 <= 64 * 1024))
})

test('private ranged preview includes all pages for papers shorter than five pages', async () => {
  const source = await makePdf(3)
  const result = await createPrivatePdfPreview({
    supabaseUrl: 'https://example.supabase.co',
    serviceRoleKey: 'server-only-test-key',
    bucket: 'knowledge-papers-private',
    storagePath: 'papers/short/original.pdf',
    fetchImpl: rangeFetcher(source),
  })
  const delivered = await PDFDocument.load(result.bytes)
  assert.equal(result.pageCount, 3)
  assert.equal(result.deliveredPages, 3)
  assert.equal(delivered.getPageCount(), 3)
})

test('private ranged preview rejects a server that ignores the Range header', async () => {
  const source = await makePdf(7)
  const fetchImpl = async (_url, init) => init.method === 'HEAD'
    ? new Response(null, { status: 200, headers: { 'Accept-Ranges': 'bytes', 'Content-Length': String(source.length) } })
    : new Response(source, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Length': String(source.length) } })
  await assert.rejects(
    createPrivatePdfPreview({
      supabaseUrl: 'https://example.supabase.co',
      serviceRoleKey: 'server-only-test-key',
      bucket: 'knowledge-papers-private',
      storagePath: 'papers/test/original.pdf',
      fetchImpl,
    }),
    (error) => error.code === 'PRIVATE_STORAGE_RANGE_RESPONSE_INVALID',
  )
})

test('private API diagnostics distinguish missing server configuration and registry/storage/PDF failures without leaking details', () => {
  const endpoint = repoFile('../api/knowledge-papers/[id].js')
  assert.match(endpoint, /url: process\.env\.SUPABASE_URL/)
  assert.match(endpoint, /service: process\.env\.SUPABASE_SERVICE_ROLE_KEY/)
  assert.doesNotMatch(endpoint, /process\.env\.VITE_SUPABASE/)
  for (const code of [
    'SERVER_CONFIGURATION_MISSING',
    'SUPABASE_CONFIGURATION_INVALID',
    'REGISTRY_UNAVAILABLE',
    'REGISTRY_SCHEMA_MISSING',
    'REGISTRY_ACCESS_DENIED',
    'REGISTRY_MAPPING_MISSING',
    'PRIVATE_STORAGE_UNAVAILABLE',
    'PRIVATE_STORAGE_TIMEOUT',
    'PRIVATE_STORAGE_ACCESS_DENIED',
    'PRIVATE_STORAGE_RANGE_TOO_LARGE',
    'PRIVATE_STORAGE_RANGE_RESPONSE_INVALID',
    'PRIVATE_OBJECT_MISSING',
    'INVALID_PDF_SOURCE',
  ]) assert.ok(endpoint.includes(`'${code}'`), `expected safe diagnostic ${code}`)
  assert.doesNotMatch(endpoint, /paperError\.message|fileError\.message/)
  assert.match(endpoint, /getPreviewFailureDiagnostic\(deliveryError/)
  assert.match(endpoint, /console\.error\(JSON\.stringify\(/)
  assert.equal(isMissingStorageObject({ statusCode: '404', message: 'private internal detail' }), true)
  assert.equal(isMissingStorageObject({ status: 503, message: 'private internal detail' }), false)
  assert.equal(isStoragePermissionError({ statusCode: '403' }), true)
  assert.equal(isStoragePermissionError({ status: 503 }), false)
  assert.equal(isStorageTimeoutError({ name: 'TimeoutError' }), true)
  assert.equal(isStorageTimeoutError({ name: 'AbortError' }), true)
  assert.equal(isStorageTimeoutError({ name: 'StorageError' }), false)
  assert.equal(isMissingRegistrySchema({ code: '42P01' }), true)
  assert.equal(isMissingRegistrySchema({ code: 'PGRST205' }), true)
  assert.equal(isMissingRegistrySchema({ code: '42501' }), false)
  assert.equal(isRegistryPermissionError({ code: '42501' }), true)
  assert.equal(isRegistryPermissionError({ code: '42P01' }), false)
})

test('private Storage diagnostics identify a failed operation without logging secrets or error messages', async () => {
  const failure = Object.assign(new TypeError('request failed at https://private.example/object using do-not-log-key'), { code: 'ECONNRESET' })
  await assert.rejects(
    createPrivatePdfPreview({
      supabaseUrl: 'https://example.supabase.co',
      serviceRoleKey: 'do-not-log-key',
      bucket: 'knowledge-papers-private',
      storagePath: 'papers/private/original.pdf',
      fetchImpl: async () => { throw failure },
    }),
    (error) => {
      const diagnostic = getPreviewFailureDiagnostic(error, {
        supabaseUrl: 'https://example.supabase.co',
        serviceRoleKey: 'do-not-log-key',
      })
      assert.equal(error.code, 'PRIVATE_STORAGE_UNAVAILABLE')
      assert.deepEqual(diagnostic, {
        stage: 'storage_head_request',
        errorClass: 'TypeError',
        errorCode: 'ECONNRESET',
        status: null,
        hasSupabaseUrl: true,
        hasServiceRoleKey: true,
      })
      assert.doesNotMatch(JSON.stringify(diagnostic), /do-not-log-key|private\.example|original\.pdf|request failed/)
      return true
    },
  )
  const unsafeFailure = Object.assign(new Error('secret detail'), {
    stage: 'https://private.example/path',
    name: 'Error\nsecret',
    code: 'secret-key-value',
    status: 900,
  })
  assert.deepEqual(getPreviewFailureDiagnostic(unsafeFailure), {
    stage: 'preview_pipeline',
    errorClass: 'Error',
    errorCode: null,
    status: null,
    hasSupabaseUrl: false,
    hasServiceRoleKey: false,
  })
})

test('local server environment uses server-only variable names in an ignored file', () => {
  const localEnvPath = fileURLToPath(new URL('../.env.local', import.meta.url))
  const contents = readFileSync(localEnvPath, 'utf8')
  const entries = Object.fromEntries(contents.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    return match ? [[match[1], match[2].trim()]] : []
  }))
  assert.ok(Object.hasOwn(entries, 'SUPABASE_URL'))
  assert.ok(Object.hasOwn(entries, 'SUPABASE_SERVICE_ROLE_KEY'))
  assert.ok(entries.SUPABASE_URL === '' || /^https:\/\//.test(entries.SUPABASE_URL))
  assert.ok(entries.SUPABASE_SERVICE_ROLE_KEY === '' || entries.SUPABASE_SERVICE_ROLE_KEY.length > 20)
  assert.doesNotMatch(contents, /^VITE_SUPABASE_SERVICE_ROLE_KEY=/m)
  assert.match(repoFile('../.gitignore'), /^\.env\.\*$/m)
})

test('ambiguous source matching cannot automatically create registry records', () => {
  const endpoint = repoFile('../api/knowledge-papers/[id].js')
  assert.match(endpoint, /\.maybeSingle\(\)/)
  assert.doesNotMatch(endpoint, /\.insert\(|\.upsert\(/)
})

test('reader accepts only an application/pdf response with a PDF signature and capped page count', async () => {
  const response = new Response('%PDF-1.7\npreview', {
    headers: {
      'Content-Type': 'application/pdf',
      'X-Paper-Page-Count': '8',
      'X-Paper-Preview-Pages': '5',
    },
  })
  const preview = await readKnowledgePaperPreview(response)
  assert.equal(preview.blob.type, 'application/pdf')
  assert.equal(preview.previewPages, 5)
  assert.equal(preview.pageCount, 8)
})

test('reader has a bounded preview request and a non-blocking request fallback', () => {
  const reader = repoFile('../src/pages/KnowledgePaperReader.jsx')
  assert.match(reader, /AbortSignal\.timeout\(58_000\)/)
  assert.match(reader, /Preview is temporarily unavailable\. You can request the full paper below\./)
  assert.match(reader, /error && !pdfDocument/)
  assert.match(reader, /href=\{requestUrl\}/)
})

test('presentation mock requires its explicit opt-in flag; ordinary development uses the real preview API', () => {
  const reader = repoFile('../src/pages/KnowledgePaperReader.jsx')
  const mock = repoFile('../src/components/knowledge/KnowledgePaperPresentationMock.jsx')
  assert.match(reader, /import\.meta\.env\.VITE_KNOWLEDGE_PAPER_PRESENTATION_MOCK === 'true'/)
  assert.doesNotMatch(reader, /VITE_KNOWLEDGE_PAPER_PRESENTATION_MODE/)
  assert.match(reader, /if \(!paper \|\| PRESENTATION_MODE\) return undefined/)
  assert.match(reader, /PRESENTATION_MODE \? <KnowledgePaperPresentationMock/)
  assert.match(reader, /onPageChange=\{changePage\}/)
  assert.match(mock, /Math\.min\(5, Math\.max\(1, page\)\)/)
  assert.match(mock, /Presentation preview · illustrative mock, not the source PDF/)
  assert.match(mock, /disabled=\{currentPage <= 1\}/)
  assert.match(mock, /disabled=\{currentPage >= 5\}/)
  assert.match(mock, /href=\{requestUrl\}/)
})

test('real preview mode retains the bounded PDF.js API viewer and safe fallback', () => {
  const reader = repoFile('../src/pages/KnowledgePaperReader.jsx')
  assert.match(reader, /fetch\(`\/api\/knowledge-papers\/\$\{encodeURIComponent\(paper\.id\)\}\?mode=preview`/)
  assert.match(reader, /readKnowledgePaperPreview\(response\)/)
  assert.match(reader, /import\('pdfjs-dist'\)/)
  assert.match(reader, /import\('pdfjs-dist\/build\/pdf\.worker\.min\.mjs\?url'\)/)
  assert.match(reader, /getDocument\(\{ data: new Uint8Array\(await preview\.blob\.arrayBuffer\(\)\) \}\)/)
  assert.match(reader, /loadedDocument\.numPages > PUBLIC_PREVIEW_PAGES/)
  assert.match(reader, /const previewPageCount = Math\.min\(pageCount \|\| PUBLIC_PREVIEW_PAGES, PUBLIC_PREVIEW_PAGES\)/)
  assert.match(reader, /Page \{wantedPage\} of \{previewPageCount\}/)
  assert.match(reader, /page\.render\(\{/)
  assert.match(reader, /<canvas ref=\{canvasRef\}/)
  assert.match(reader, /: error && !pdfDocument/)
  assert.doesNotMatch(reader, /<iframe/)
})

test('Vite proxies API requests to the isolated local Vercel runtime', () => {
  const viteConfig = repoFile('../vite.config.js')
  const packageJson = JSON.parse(repoFile('../package.json'))
  assert.match(viteConfig, /['"]\/api['"]\s*:\s*\{[\s\S]*target:\s*['"]http:\/\/127\.0\.0\.1:3001['"]\s*,?\s*changeOrigin:\s*true/)
  assert.match(packageJson.scripts['dev:vercel'], /--listen 3001/)
})

test('reader rejects SPA HTML, JSON errors, invalid PDF bytes, and preview page counts over five', async () => {
  await assert.rejects(
    readKnowledgePaperPreview(new Response('<!doctype html>', { headers: { 'Content-Type': 'text/html' } })),
    /website page instead of a PDF/,
  )
  await assert.rejects(
    readKnowledgePaperPreview(new Response('{"error":"unavailable"}', { status: 503, headers: { 'Content-Type': 'application/json' } })),
    /not configured or available/,
  )
  await assert.rejects(
    readKnowledgePaperPreview(new Response('not a pdf', { headers: { 'Content-Type': 'application/pdf', 'X-Paper-Preview-Pages': '2' } })),
    /not a valid PDF/,
  )
  await assert.rejects(
    readKnowledgePaperPreview(new Response('%PDF-1.7', { headers: { 'Content-Type': 'application/pdf', 'X-Paper-Preview-Pages': '6' } })),
    /invalid page limit/,
  )
})

test('SPA fallback explicitly excludes API routes', () => {
  const config = JSON.parse(repoFile('../vercel.json'))
  assert.equal(config.rewrites[0].source, '/:path((?!api/).*)')
  assert.equal(config.functions['api/knowledge-papers/*.js'].maxDuration, 60)
})

test('Knowledge Papers API directory contains only the intended public function entry point', () => {
  const routes = readdirSync(fileURLToPath(new URL('../api/knowledge-papers/', import.meta.url))).sort()
  assert.deepEqual(routes, ['[id].js'])
  const endpoint = repoFile('../api/knowledge-papers/[id].js')
  assert.match(endpoint, /from '\.\.\/\.\.\/src\/lib\/knowledgePaperPdfDelivery\.js'/)
})

test('request button pre-fills titles for mapped and unmapped catalogue papers', () => {
  const catalogue = JSON.parse(repoFile('../content/knowledge-papers.json'))
  const papers = [
    catalogue.find((paper) => paper.id === 'india-spain-shared-growth-2026'),
    catalogue.find((paper) => paper.id === 'india-tea-industry-growth-2026'),
  ]
  assert.ok(papers.every(Boolean))
  for (const paper of papers) {
    const url = new URL(getKnowledgePaperRequestUrl(paper))
    assert.equal(url.hostname, 'docs.google.com')
    assert.equal(url.searchParams.get('entry.79280790'), paper.title)
  }
  const url = new URL(getKnowledgePaperRequestUrl(papers[0]))
  assert.equal(url.searchParams.get('entry.79280790'), 'India & Spain: Strengthening Partnership, Shaping Shared Growth')
  const reader = repoFile('../src/pages/KnowledgePaperReader.jsx')
  assert.match(reader, /Request Full Knowledge Paper/)
  assert.match(reader, /href=\{requestUrl\}/)
  assert.match(reader, /getKnowledgePaperRequestUrl\(paper\)/)
  assert.equal(url.searchParams.get('entry.26019014'), 'International & Sectoral')
})

test('public catalogue explains the no-login Google Form request flow', () => {
  const cataloguePage = repoFile('../src/pages/KnowledgePapers.jsx')
  const reader = repoFile('../src/pages/KnowledgePaperReader.jsx')
  assert.match(cataloguePage, /without signing in/)
  assert.match(cataloguePage, /enquiry form/)
  assert.doesNotMatch(cataloguePage, /signed-in readers|log in|sign in to request/i)
  assert.match(reader, /Request Full Knowledge Paper/)
  assert.match(reader, /href=\{requestUrl\}/)
})

test('catalogue source mappings remain absent until verified private registry records exist', () => {
  const catalogue = JSON.parse(repoFile('../content/knowledge-papers.json'))
  assert.equal(catalogue.length, 109)
  assert.ok(catalogue.every((paper) => !paper.storagePath && !paper.pdfUrl))
  const endpoint = repoFile('../api/knowledge-papers/[id].js')
  assert.match(endpoint, /if \(!paper\) return error\(res, 404, 'REGISTRY_MAPPING_MISSING'/)
})

test('every published paper card opens the shared paper-ID reader route', () => {
  const catalogue = JSON.parse(repoFile('../content/knowledge-papers.json'))
  const card = repoFile('../src/components/knowledge/KnowledgePaperCard.jsx')
  const app = repoFile('../src/App.jsx')
  assert.equal(catalogue.length, 109)
  assert.match(card, /to=\{`\/knowledge-papers\/\$\{encodeURIComponent\(paper\.id\)\}`\}/)
  assert.match(app, /path="\/knowledge-papers\/:paperId"/)
})

test('source audit manifest is inventory-only and excludes ambiguous sources from verified imports', () => {
  const manifest = JSON.parse(repoFile('../scripts/knowledge-paper-source-manifest.json'))
  const catalogue = JSON.parse(repoFile('../content/knowledge-papers.json'))
  const catalogueIds = new Set(catalogue.map((paper) => paper.id))
  assert.equal(manifest.uploadApproved, false)
  assert.equal(manifest.localVerifiedSources.length, 7)
  assert.ok(manifest.localVerifiedSources.every((source) => catalogueIds.has(source.catalogueId) && source.status === 'verified-local-not-uploaded'))
  assert.ok(manifest.reviewDriveCandidates.some((source) => source.matchConfidence === 'ambiguous' && source.status === 'human-review-required'))
  assert.ok(manifest.unmatchedDriveCountries.length > 0)
})

test('coverage inventory includes every catalogue ID without inventing private paths', () => {
  const coverage = JSON.parse(repoFile('../content/knowledge-paper-coverage.json'))
  const catalogue = JSON.parse(repoFile('../content/knowledge-papers.json'))
  const endpoint = repoFile('../api/knowledge-papers/[id].js')
  assert.equal(coverage.catalogueCount, 109)
  assert.equal(coverage.papers.length, catalogue.length)
  assert.deepEqual(coverage.papers.map((paper) => paper.id), catalogue.map((paper) => paper.id))
  assert.ok(coverage.papers.every((paper) => paper.privateStoragePath === null && paper.actualApiPreviewVerified === false))
  assert.equal(coverage.statusCounts['source-pdf-ready-private-storage-upload-mapping-pending'], 7)
  assert.equal(coverage.statusCounts['source-pdf-found-match-needs-review'], 101)
  assert.equal(coverage.statusCounts['source-pdf-not-found-in-accessible-sources'], 1)
  assert.doesNotMatch(endpoint, /india-(?:cyprus|laos|sudan|tajikistan|indonesia|tunisia|spain)-/i)
  assert.match(endpoint, /req\.query\.id/)
})

test('existing news-admin routes and authentication checks remain present', () => {
  const app = repoFile('../src/App.jsx')
  const login = repoFile('../src/pages/admin/AdminLogin.jsx')
  const guard = repoFile('../src/components/admin/AdminGuard.jsx')
  assert.match(app, /path="\/admin\/login"/)
  assert.match(app, /path="\/admin\/news"/)
  assert.match(app, /path="\/admin\/news\/new"/)
  assert.match(login, /signInWithPassword/)
  assert.match(login, /isCurrentUserAdmin/)
  assert.match(guard, /isCurrentUserAdmin/)
})
