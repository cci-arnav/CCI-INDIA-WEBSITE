import { useState } from 'react'
import { CalendarDays, Download, ExternalLink, FileText, MapPin } from 'lucide-react'
import { validDate } from '../../lib/knowledgePapers'

const formatDate = (value, fallbackYear) => {
  const date = validDate(value)
  if (date) return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(date)
  return Number(fallbackYear) ? String(fallbackYear) : ''
}

const countryFlag = (code) => /^[A-Z]{2}$/.test(code)
  ? String.fromCodePoint(...code.split('').map((letter) => 127397 + letter.charCodeAt()))
  : ''

export default function KnowledgePaperCard({ paper, featured = false }) {
  const [coverFailed, setCoverFailed] = useState(false)
  const publicationDate = formatDate(paper.publishedAt, paper.year)
  const flag = countryFlag(paper.countryCode)
  const hasCover = paper.coverImage && !coverFailed

  return (
    <article className={`flex h-full flex-col overflow-hidden border border-border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md ${featured ? 'md:grid md:grid-cols-[minmax(240px,0.8fr)_1.2fr]' : ''}`}>
      <div className={`${featured ? 'min-h-64 md:min-h-full' : 'aspect-[4/3]'} flex items-center justify-center overflow-hidden bg-[linear-gradient(145deg,var(--color-navy-deep),var(--color-royal))]`}>
        {hasCover ? (
          <img src={paper.coverImage} alt="" width="640" height="480" loading="lazy" className="h-full w-full object-cover" onError={() => setCoverFailed(true)} />
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 text-center text-white/80">
            <FileText size={48} strokeWidth={1.5} aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">CCI India Research</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-fg">
          <span className="inline-flex items-center gap-1.5 font-semibold text-navy-deep">
            {flag && <span aria-hidden="true">{flag}</span>}
            {paper.country}
          </span>
          {paper.region && <span className="inline-flex items-center gap-1"><MapPin size={13} aria-hidden="true" />{paper.region}</span>}
        </div>
        <h2 className={`${featured ? 'text-xl sm:text-2xl' : 'text-lg'} font-serif font-bold leading-snug text-navy-deep`}>{paper.title}</h2>
        {paper.description && <p className="mt-3 line-clamp-2 text-sm text-muted-fg">{paper.description}</p>}
        {(publicationDate || paper.fileSize) && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-fg">
            {publicationDate && <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} aria-hidden="true" />{publicationDate}</span>}
            {paper.fileSize && <span>PDF · {paper.fileSize}</span>}
          </div>
        )}
        {paper.tags.length > 0 && <ul className="mt-4 flex flex-wrap gap-2" aria-label="Topics">{paper.tags.map((tag) => <li key={tag} className="border border-border bg-off-white px-2 py-1 text-[11px] font-medium text-navy-deep">{tag}</li>)}</ul>}
        {paper.pdfUrl && (
          <div className="mt-auto flex flex-wrap gap-3 pt-6">
            <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 bg-navy-deep px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy">
              View Paper <ExternalLink size={15} aria-hidden="true" /><span className="sr-only">(PDF, opens in a new tab)</span>
            </a>
            <a href={paper.pdfUrl} download className="inline-flex min-h-11 items-center justify-center gap-2 border border-navy-deep px-4 py-2 text-sm font-medium text-navy-deep transition-colors hover:bg-off-white">
              Download PDF <Download size={15} aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
    </article>
  )
}
