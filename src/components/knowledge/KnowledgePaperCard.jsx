import { useState } from 'react'
import { CalendarDays, FileText, LockKeyhole, MapPin } from 'lucide-react'
import { getKnowledgePaperRequestUrl, validDate } from '../../lib/knowledgePapers'

const formatDate = (value, fallbackYear) => {
  const date = validDate(value)
  if (date) return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(date)
  return Number(fallbackYear) ? String(fallbackYear) : ''
}

const countryFlag = (code) => /^[A-Z]{2}$/.test(code)
  ? String.fromCodePoint(...code.split('').map((letter) => 127397 + letter.charCodeAt()))
  : ''

const fallbackGradient = {
  Ministry: 'from-[#132f4f] via-[#1e4ca0] to-[#387fc4]',
  'State & UT': 'from-[#173b34] via-[#16745c] to-[#36a579]',
  'International & Sectoral': 'from-[#51275f] via-[#74448a] to-[#b05c73]',
}

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
          <div className={`relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br ${fallbackGradient[paper.collection] || 'from-navy-deep via-royal to-[#3d83c8]'} p-5 text-white sm:p-6`}>
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full border-[24px] border-white/10" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-saffron/20 blur-2xl" aria-hidden="true" />
            <div className="relative flex items-center justify-between gap-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">CCI India Knowledge Paper</span>
              <FileText size={28} strokeWidth={1.5} className="shrink-0 text-white/70" aria-hidden="true" />
            </div>
            <h3 className="relative my-5 line-clamp-4 font-serif text-xl font-bold leading-snug text-white sm:text-2xl">{paper.title}</h3>
            <div className="relative flex items-end justify-between gap-4 border-t border-white/25 pt-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">{paper.collection || 'Research'}</span>
              <img src="/brand/cci-logo.png" alt="" width="96" height="42" className="h-8 w-auto rounded-sm bg-white/95 px-2 py-1 object-contain" />
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-fg">
          {paper.collection && <span className="border border-saffron/40 bg-amber-50 px-2 py-0.5 font-semibold uppercase tracking-wide text-saffron">{paper.collection}</span>}
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
        <div className="mt-auto pt-6">
          <a href={getKnowledgePaperRequestUrl(paper)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 bg-navy-deep px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy">
            Request Access <LockKeyhole size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  )
}
