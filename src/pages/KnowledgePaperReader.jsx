import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, FileLock2, LoaderCircle, LockKeyhole } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import data from '../../content/knowledge-papers.json'
import { getKnowledgePaperRequestUrl, getPublishedKnowledgePapers } from '../lib/knowledgePapers'
import { readKnowledgePaperPreview } from '../lib/knowledgePaperPreview.js'
import KnowledgePaperPresentationMock from '../components/knowledge/KnowledgePaperPresentationMock.jsx'

const papers = getPublishedKnowledgePapers(data)
const PUBLIC_PREVIEW_PAGES = 5
const PREVIEW_UNAVAILABLE_MESSAGE = 'Preview is temporarily unavailable. You can request the full paper below.'
const PRESENTATION_MODE = import.meta.env.VITE_KNOWLEDGE_PAPER_PRESENTATION_MOCK === 'true'

export default function KnowledgePaperReader() {
  const { paperId } = useParams()
  const [params, setParams] = useSearchParams()
  const paper = useMemo(() => papers.find((item) => item.id === paperId), [paperId])
  const [pdfDocument, setPdfDocument] = useState(null)
  const canvasRef = useRef(null)
  const viewerRef = useRef(null)
  const [pageCount, setPageCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const wantedPage = Math.max(1, Number(params.get('page')) || 1)
  const previewPageCount = Math.min(pageCount || PUBLIC_PREVIEW_PAGES, PUBLIC_PREVIEW_PAGES)
  const lastPreviewPage = previewPageCount
  const isLocked = pageCount > PUBLIC_PREVIEW_PAGES && wantedPage > PUBLIC_PREVIEW_PAGES

  useEffect(() => {
    if (!paper || PRESENTATION_MODE) return undefined
    let active = true
    let loadingTask
    let loadedDocument
    const loadPreview = async () => {
      await Promise.resolve()
      if (!active) return
      setLoading(true)
      setError('')
      setPdfDocument(null)
      try {
        // No user token, access request, or client-selected page limit is sent.
        const response = await fetch(`/api/knowledge-papers/${encodeURIComponent(paper.id)}?mode=preview`, { signal: AbortSignal.timeout(58_000) })
        const preview = await readKnowledgePaperPreview(response)
        const [{ getDocument, GlobalWorkerOptions }, worker] = await Promise.all([
          import('pdfjs-dist'),
          import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
        ])
        GlobalWorkerOptions.workerSrc = worker.default
        loadingTask = getDocument({ data: new Uint8Array(await preview.blob.arrayBuffer()) })
        loadedDocument = await loadingTask.promise
        if (loadedDocument.numPages !== preview.previewPages || loadedDocument.numPages > PUBLIC_PREVIEW_PAGES) {
          throw new Error('The preview document did not match its page limit.')
        }
        if (!active) { await loadedDocument.destroy(); return }
        setPageCount(preview.pageCount)
        setPdfDocument(loadedDocument)
      } catch {
        if (active) setError(PREVIEW_UNAVAILABLE_MESSAGE)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadPreview()
    return () => {
      active = false
      if (loadedDocument) void loadedDocument.destroy()
      else if (loadingTask) void loadingTask.destroy()
    }
  }, [paper])

  useEffect(() => {
    if (!pdfDocument || !canvasRef.current || !viewerRef.current || wantedPage > PUBLIC_PREVIEW_PAGES) return undefined
    let cancelled = false
    let renderTask
    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(wantedPage)
        if (cancelled) return
        const baseViewport = page.getViewport({ scale: 1 })
        const availableWidth = Math.max(280, viewerRef.current.clientWidth - 32)
        const viewport = page.getViewport({ scale: Math.min(1.5, availableWidth / baseViewport.width) })
        const outputScale = Math.min(window.devicePixelRatio || 1, 2)
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        canvas.width = Math.floor(viewport.width * outputScale)
        canvas.height = Math.floor(viewport.height * outputScale)
        canvas.style.width = `${Math.floor(viewport.width)}px`
        canvas.style.height = `${Math.floor(viewport.height)}px`
        renderTask = page.render({
          canvas,
          canvasContext: context,
          viewport,
          transform: outputScale === 1 ? null : [outputScale, 0, 0, outputScale, 0, 0],
        })
        await renderTask.promise
      } catch (renderError) {
        if (!cancelled && renderError?.name !== 'RenderingCancelledException') setError(PREVIEW_UNAVAILABLE_MESSAGE)
      }
    }
    renderPage()
    return () => {
      cancelled = true
      renderTask?.cancel()
    }
  }, [pdfDocument, wantedPage])

  const changePage = (nextPage) => setParams(nextPage <= 1 ? {} : { page: String(nextPage) }, { replace: true })
  const requestUrl = paper ? getKnowledgePaperRequestUrl(paper) : ''

  if (!paper) return <main className="paper-reader px-4 py-16 text-center"><h1 className="font-serif text-2xl font-bold text-navy-deep">Knowledge paper not found</h1><Link className="mt-5 inline-flex min-h-11 items-center gap-2 text-royal underline" to="/knowledge-papers"><ArrowLeft size={16} />Back to Knowledge Papers</Link></main>

  return <main className="paper-reader">
    <header className="paper-reader__bar">
      <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-royal hover:underline" to="/knowledge-papers"><ArrowLeft size={17} />Knowledge Papers</Link>
      <div className="min-w-0 flex-1 md:px-6"><p className="truncate font-serif font-bold text-navy-deep">{paper.title}</p><p className="mt-1 text-xs text-muted-fg">{PRESENTATION_MODE ? 'Local presentation mode · five illustrative mock pages' : `Free preview · up to five pages${pageCount ? ` · ${pageCount} pages total` : ''}`}</p></div>
      <a className="inline-flex min-h-11 items-center justify-center bg-navy-deep px-4 py-2 text-center text-sm font-semibold text-white hover:bg-navy" href={requestUrl} target="_blank" rel="noreferrer">Request Full Knowledge Paper</a>
    </header>
    {PRESENTATION_MODE ? <KnowledgePaperPresentationMock paper={paper} page={wantedPage} onPageChange={changePage} requestUrl={requestUrl} />
      : loading ? <div className="grid min-h-[60vh] place-items-center text-navy-deep" role="status"><LoaderCircle className="animate-spin" aria-hidden="true" />Loading preview…</div>
      : error && !pdfDocument ? <section className="paper-reader__locked" role="status"><FileLock2 className="text-royal" size={32} aria-hidden="true" /><h1 className="mt-4 font-serif text-2xl font-bold text-navy-deep">Preview temporarily unavailable</h1><p className="mt-3 text-sm leading-6 text-muted-fg">{error}</p><a className="mt-5 inline-flex min-h-11 items-center gap-2 bg-navy-deep px-4 py-2 text-sm font-semibold text-white" href={requestUrl} target="_blank" rel="noreferrer">Request Full Knowledge Paper <ArrowRight size={15} /></a><Link className="mt-4 flex min-h-11 items-center text-sm text-royal underline" to="/knowledge-papers">Back to Knowledge Papers</Link></section>
      : isLocked ? <section className="paper-reader__locked" aria-labelledby="continue-reading"><LockKeyhole size={30} className="text-royal" aria-hidden="true" /><h1 id="continue-reading" className="mt-4 font-serif text-2xl font-bold text-navy-deep">Continue Reading</h1><p className="mt-3 text-sm leading-6 text-muted-fg">You’ve reached the end of the free preview. Submit a request and CCI India will review it and contact you outside the website.</p><a className="mt-5 inline-flex min-h-11 items-center gap-2 bg-navy-deep px-4 py-2 text-sm font-semibold text-white" href={requestUrl} target="_blank" rel="noreferrer">Request Full Knowledge Paper <ArrowRight size={15} /></a><Link className="mt-4 flex min-h-11 items-center text-sm text-royal underline" to="/knowledge-papers">Back to Knowledge Papers</Link></section>
      : <><div className="paper-reader__canvas" aria-label={`PDF reader: ${paper.title}`} ref={viewerRef}>{pdfDocument && !error && <canvas ref={canvasRef} role="img" aria-label={`${paper.title}, page ${wantedPage} of the free preview`} />}{error && pdfDocument && <p className="p-6 text-center text-sm text-muted-fg" role="status">{error}</p>}</div><nav className="paper-reader__controls" aria-label="Preview page navigation"><button type="button" disabled={wantedPage <= 1} onClick={() => changePage(wantedPage - 1)}><ArrowLeft className="mr-2 inline" size={15} />Previous</button><span className="text-sm font-semibold text-navy-deep" aria-live="polite">Page {wantedPage} of {previewPageCount}</span><button type="button" disabled={wantedPage >= lastPreviewPage} onClick={() => changePage(wantedPage + 1)}><span className="mr-2">Next</span><ArrowRight className="inline" size={15} /></button></nav><p className="pb-4 text-center text-sm text-muted-fg">Pages 1–{previewPageCount} are included in this free preview.</p>{pageCount > PUBLIC_PREVIEW_PAGES && <button type="button" className="mx-auto mb-8 block min-h-11 border border-royal px-4 text-sm font-semibold text-royal hover:bg-royal/5" onClick={() => changePage(PUBLIC_PREVIEW_PAGES + 1)}>Continue to restricted pages</button>}</>}
  </main>
}
