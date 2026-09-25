import { ArrowRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getLocation } from '../../data/bharatInvestmentGrid'

export default function OpportunityCard({ opportunity }) {
  const location = getLocation(opportunity.stateSlug)
  return (
    <article className="flex h-full flex-col border border-border bg-white p-5 shadow-sm transition hover:border-royal/60 focus-within:border-royal">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-saffron">Investment Opportunity</p>
      <h3 className="text-lg font-bold leading-snug">{opportunity.name}</h3>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-fg"><MapPin size={14} aria-hidden="true" /> {location?.name} · {location?.region}</p>
      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div><dt className="text-muted-fg">Sector</dt><dd className="font-semibold text-navy-deep">{opportunity.sector}</dd></div>
        <div><dt className="text-muted-fg">Stage</dt><dd className="font-semibold text-navy-deep">{opportunity.projectStage}</dd></div>
        <div className="col-span-2"><dt className="text-muted-fg">Investment requirement</dt><dd className="font-semibold text-navy-deep">{opportunity.investmentRequirement}</dd></div>
        <div className="col-span-2"><dt className="text-muted-fg">Opportunity type</dt><dd className="font-semibold text-navy-deep">{opportunity.opportunityType}</dd></div>
      </dl>
      <p className="mt-4 line-clamp-2 text-sm text-muted-fg">{opportunity.description}</p>
      <Link to={`/bharat-investment-grid/opportunity/${opportunity.slug}`} className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-bold text-royal hover:underline">
        View Details <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </article>
  )
}
