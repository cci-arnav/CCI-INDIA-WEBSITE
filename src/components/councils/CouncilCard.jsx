import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import CouncilVisual from './CouncilVisual'

export default function CouncilCard({ council }) {
  const description = council.sourceStatus !== 'unavailable' ? (Array.isArray(council.description) ? council.description[0] : council.description) : null
  return (
    <Link to={`/councils/${council.slug}`} className="group flex h-full flex-col overflow-hidden border border-border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-royal hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal">
      <CouncilVisual council={council} />
      <div className="flex flex-1 flex-col p-5">
        <span className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-saffron">{council.type === 'sector' ? 'Sector & Regional' : council.type}</span>
        <h3 className="mb-2 font-serif text-base font-bold text-navy-deep transition-colors group-hover:text-royal">{council.name}</h3>
        <p className="mb-4 line-clamp-2 text-sm text-muted-fg">{description || 'Additional information about this council will be published soon.'}</p>
        <span className="mt-auto flex items-center gap-1 text-xs font-semibold text-royal">View details <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
      </div>
    </Link>
  )
}
