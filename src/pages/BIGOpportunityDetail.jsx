import { useState } from 'react'
import { ArrowLeft, CheckCircle2, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import DemoModal from '../components/big/DemoModal'
import { getLocation, getOpportunity } from '../data/bharatInvestmentGrid'

export default function BIGOpportunityDetail() {
  const { opportunitySlug } = useParams()
  const item = getOpportunity(opportunitySlug)
  const [interestOpen, setInterestOpen] = useState(false)

  if (!item) return (
    <section className="section-padding"><div className="container-main max-w-3xl"><p className="text-xs font-bold uppercase tracking-wider text-saffron">Opportunity not found</p><h1 className="mt-2 text-3xl font-bold">This opportunity is unavailable</h1><p className="mt-3 text-muted-fg">The link may be incomplete or the opportunity record may have changed.</p><Link to="/bharat-investment-grid#opportunities" className="mt-6 inline-flex min-h-11 items-center gap-2 bg-navy-deep px-5 py-2 font-bold text-white"><ArrowLeft size={16} /> Browse opportunities</Link></div></section>
  )

  const location = getLocation(item.stateSlug)
  return (
    <>
      <header className="bg-navy-deep text-white"><div className="container-main py-10 md:py-14"><nav aria-label="Breadcrumb" className="text-xs text-white/65"><Link to="/">Home</Link> / <Link to="/bharat-investment-grid">Bharat Investment Grid</Link> / <span aria-current="page">Opportunity detail</span></nav><p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-saffron">Investment Opportunity</p><h1 className="mt-2 max-w-4xl text-3xl font-bold text-white sm:text-4xl">{item.name}</h1><p className="mt-4 flex items-center gap-2 text-sm text-white/70"><MapPin size={16} aria-hidden="true" /> {location?.name} · {location?.region}</p></div></header>
      <main className="section-padding border-t border-border bg-off-white"><div className="container-main grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_.75fr]">
        <article className="border border-border bg-white p-5 sm:p-7"><h2 className="text-2xl font-bold">Project overview</h2><p className="mt-3 text-sm text-muted-fg">{item.overview}</p><p className="mt-3 text-sm text-muted-fg">{item.description}</p><h2 className="mt-8 text-xl font-bold">Key highlights</h2><ul className="mt-3 space-y-2">{item.highlights.map((highlight) => <li key={highlight} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 shrink-0 text-green" size={17} aria-hidden="true" />{highlight}</li>)}</ul><h2 className="mt-8 text-xl font-bold">Project requirements</h2><ul className="mt-3 space-y-2">{item.requirements.map((requirement) => <li key={requirement} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 shrink-0 text-green" size={17} aria-hidden="true" />{requirement}</li>)}</ul></article>
        <aside className="h-fit border-t-4 border-saffron bg-white p-5"><h2 className="text-xl font-bold">Opportunity summary</h2><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-muted-fg">State / UT</dt><dd className="font-bold">{location?.name}</dd></div><div><dt className="text-muted-fg">Sector</dt><dd className="font-bold">{item.sector}</dd></div><div><dt className="text-muted-fg">Project stage</dt><dd className="font-bold">{item.projectStage}</dd></div><div><dt className="text-muted-fg">Project type</dt><dd className="font-bold">{item.investmentSize}</dd></div><div><dt className="text-muted-fg">Investment requirement</dt><dd className="font-bold">{item.investmentRequirement}</dd></div><div><dt className="text-muted-fg">Opportunity type</dt><dd className="font-bold">{item.opportunityType}</dd></div></dl><button type="button" onClick={() => setInterestOpen(true)} className="mt-6 min-h-11 w-full bg-navy-deep px-4 py-2.5 font-bold text-white">Express Interest</button>{location && <Link to={`/bharat-investment-grid/state/${location.slug}`} className="mt-3 flex min-h-11 items-center justify-center border border-navy-deep px-4 py-2 text-center text-sm font-bold text-navy-deep">Explore {location.name}</Link>}</aside>
      </div></main>
      <DemoModal open={interestOpen} onClose={() => setInterestOpen(false)} mode="interest" opportunityName={item.name} />
    </>
  )
}
