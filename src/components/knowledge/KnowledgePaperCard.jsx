import { useState } from 'react'
import { CalendarDays, FileText, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { validDate } from '../../lib/knowledgePapers'
import { getKnowledgePaperImage, imageRegistry } from '../../data/imageRegistry'

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
  const [failedFlags, setFailedFlags] = useState([])
  const publicationDate = formatDate(paper.publishedAt, paper.year)
  const flag = countryFlag(paper.countryCode)
  const artwork = getKnowledgePaperImage(paper.id)
  const fallbackImage = imageRegistry.fallbacks[paper.collection === 'Ministry' ? 'ministry' : 'knowledgePaper']
  const hasCover = artwork?.image && !coverFailed
  const availableFlags = artwork?.flags?.filter((item) => !failedFlags.includes(item.src)) || []

  return (
    <article className={`flex h-full flex-col overflow-hidden border border-border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md ${featured ? 'md:grid md:grid-cols-[minmax(240px,0.8fr)_1.2fr]' : ''}`}>
      <div className={`${featured ? 'min-h-64 md:min-h-full' : 'aspect-[4/3]'} flex items-center justify-center overflow-hidden bg-[linear-gradient(145deg,var(--color-navy-deep),var(--color-royal))]`}>
        {hasCover ? (
          <img src={artwork.image} alt={artwork.alt} width="640" height="480" loading="lazy" className="h-full w-full object-cover" onError={() => setCoverFailed(true)} />
        ) : availableFlags.length ? (
          <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#102c49] via-[#17466b] to-[#216d87] p-5 text-white sm:p-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full border-[24px] border-white/10" aria-hidden="true" />
            <div className="relative flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">CCI India · Bilateral research</span>
              <FileText size={25} strokeWidth={1.5} className="shrink-0 text-white/70" aria-hidden="true" />
            </div>
            <div className="relative my-5 flex items-center justify-center gap-4 sm:gap-6" aria-label={availableFlags.map((item) => item.alt).join(' and ')}>
              {availableFlags.map((item, index) => <div key={item.src} className="flex items-center gap-4 sm:gap-6">
                {index > 0 && <span aria-hidden="true" className="text-xl font-light text-saffron">×</span>}
                <img src={item.src} alt={item.alt} width="96" height="64" loading="lazy" className="h-12 w-[4.5rem] rounded-sm border border-white/30 bg-white object-cover shadow-lg sm:h-16 sm:w-24" onError={() => setFailedFlags((current) => [...current, item.src])} />
              </div>)}
            </div>
            <div className="relative border-t border-white/25 pt-3">
              <h3 className="line-clamp-2 font-serif text-lg font-bold leading-snug text-white sm:text-xl">India &amp; {paper.country}</h3>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75">Trade · Investment · Cooperation</p>
            </div>
          </div>
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
              <img src={fallbackImage} alt="" width="96" height="42" className="h-8 w-auto rounded-sm bg-white/95 px-2 py-1 object-contain" />
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
        {paper.description && <p className="prose-copy mt-3 line-clamp-2 text-sm text-muted-fg">{paper.description}</p>}
        {(publicationDate || paper.fileSize) && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-fg">
            {publicationDate && <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} aria-hidden="true" />{publicationDate}</span>}
            {paper.fileSize && <span>PDF · {paper.fileSize}</span>}
          </div>
        )}
        {paper.tags.length > 0 && <ul className="mt-4 flex flex-wrap gap-2" aria-label="Topics">{paper.tags.map((tag) => <li key={tag} className="border border-border bg-off-white px-2 py-1 text-[11px] font-medium text-navy-deep">{tag}</li>)}</ul>}
        <div className="mt-auto pt-6">
          <Link to={`/knowledge-papers/${encodeURIComponent(paper.id)}`} className="inline-flex min-h-11 items-center justify-center gap-2 bg-navy-deep px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy">Read Preview <FileText size={15} aria-hidden="true" /></Link>
        </div>
      </div>
    </article>
  )
}
