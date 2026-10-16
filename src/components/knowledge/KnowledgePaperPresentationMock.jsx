import { ArrowLeft, ArrowRight, FileText } from 'lucide-react'

const paperDetails = (paper) => [
  ['Country / focus', paper.country],
  ['Collection', paper.collection || 'Knowledge Paper'],
  ['Region', paper.region || 'Not specified'],
  ['Publication year', paper.year || 'Not specified'],
]

export default function KnowledgePaperPresentationMock({ paper, page, onPageChange, requestUrl }) {
  const currentPage = Math.min(5, Math.max(1, page))
  const topics = paper.tags?.length ? paper.tags : ['Knowledge Paper']

  return <section className="mx-auto w-full max-w-5xl px-4 pb-10" aria-label={`Presentation mock for ${paper.title}`}>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-fg">
      <span>Presentation preview · illustrative mock, not the source PDF</span>
      <span>Page {currentPage} of 5</span>
    </div>
    <article className="relative mx-auto flex min-h-[min(70vh,760px)] max-w-4xl flex-col overflow-hidden border border-border bg-white p-7 shadow-sm sm:p-12">
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-saffron via-[#ef9e32] to-navy-deep" aria-hidden="true" />
      <header className="flex items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">CCI India</p>
          <p className="mt-1 text-xs text-muted-fg">Chamber of Commerce &amp; Industry of India</p>
        </div>
        <FileText className="shrink-0 text-royal" size={27} aria-hidden="true" />
      </header>

      <div className="my-auto py-10" aria-live="polite">
        {currentPage === 1 && <>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-royal">Knowledge Paper · Presentation mock</p>
          <h1 className="mt-5 max-w-3xl font-serif text-3xl font-bold leading-tight text-navy-deep sm:text-5xl">{paper.title}</h1>
          <p className="mt-5 text-lg text-muted-fg">{paper.country}{paper.region ? ` · ${paper.region}` : ''}</p>
          {paper.description && <p className="prose-copy mt-7 max-w-3xl text-base leading-7 text-muted-fg">{paper.description}</p>}
        </>}

        {currentPage === 2 && <>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-royal">Paper overview · catalogue metadata</p>
          <h2 className="mt-4 font-serif text-3xl font-bold text-navy-deep">{paper.title}</h2>
          <p className="prose-copy mt-6 max-w-3xl text-lg leading-8 text-muted-fg">{paper.description || 'A CCI India Knowledge Paper.'}</p>
        </>}

        {currentPage === 3 && <>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-royal">Topics listed in the catalogue</p>
          <h2 className="mt-4 font-serif text-3xl font-bold text-navy-deep">Areas of focus</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">{topics.map((topic) => <li key={topic} className="border-l-4 border-saffron bg-off-white p-5 text-lg font-semibold text-navy-deep">{topic}</li>)}</ul>
        </>}

        {currentPage === 4 && <>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-royal">Paper details · catalogue metadata</p>
          <h2 className="mt-4 font-serif text-3xl font-bold text-navy-deep">At a glance</h2>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2">{paperDetails(paper).map(([label, value]) => <div key={label} className="border border-border p-5"><dt className="text-xs font-bold uppercase tracking-wide text-muted-fg">{label}</dt><dd className="mt-2 text-lg font-semibold text-navy-deep">{value}</dd></div>)}</dl>
        </>}

        {currentPage === 5 && <>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-royal">Continue with CCI India</p>
          <h2 className="mt-4 font-serif text-3xl font-bold text-navy-deep">Request the complete paper</h2>
          <p className="prose-copy mt-6 max-w-2xl text-lg leading-8 text-muted-fg">This local presentation mock contains catalogue information only. Use the enquiry form to request the complete Knowledge Paper from CCI India.</p>
          <a href={requestUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex min-h-12 items-center justify-center bg-navy-deep px-5 py-3 font-semibold text-white hover:bg-navy">Request Full Knowledge Paper <ArrowRight className="ml-2" size={16} aria-hidden="true" /></a>
        </>}
      </div>

      <footer className="flex items-center justify-between gap-4 border-t border-border pt-5 text-xs text-muted-fg">
        <span>Mock pages use published catalogue metadata only.</span>
        <span>{String(currentPage).padStart(2, '0')} / 05</span>
      </footer>
    </article>

    <nav className="paper-reader__controls" aria-label="Presentation mock page navigation">
      <button type="button" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}><ArrowLeft className="mr-2 inline" size={15} />Previous</button>
      <span className="text-sm font-semibold text-navy-deep" aria-live="polite">Page {currentPage} of 5</span>
      <button type="button" disabled={currentPage >= 5} onClick={() => onPageChange(currentPage + 1)}><span className="mr-2">Next</span><ArrowRight className="inline" size={15} /></button>
    </nav>
  </section>
}
