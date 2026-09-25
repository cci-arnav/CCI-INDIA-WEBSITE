import { ArrowLeft, Building2, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import BIGDisclosure from '../components/big/BIGDisclosure'
import BIGStateHero from '../components/big/BIGStateHero'
import OpportunityCard from '../components/big/OpportunityCard'
import { getLocation, getLocationOpportunities } from '../data/bharatInvestmentGrid'

export default function BIGStateDetail() {
  const { stateSlug } = useParams()
  const location = getLocation(stateSlug)

  if (!location) return (
    <section className="section-padding"><div className="container-main max-w-3xl"><p className="text-xs font-bold uppercase tracking-wider text-saffron">Location not found</p><h1 className="mt-2 text-3xl font-bold">This BIG location is unavailable</h1><p className="mt-3 text-muted-fg">The State or Union Territory link may be incomplete or outdated.</p><Link to="/bharat-investment-grid#directory" className="mt-6 inline-flex min-h-11 items-center gap-2 bg-navy-deep px-5 py-2 font-bold text-white"><ArrowLeft size={16} /> Return to BIG directory</Link></div></section>
  )

  const items = getLocationOpportunities(location.slug)
  return (
    <>
      <BIGStateHero location={location} />
      <div className="container-main py-5"><BIGDisclosure /></div>
      <main>
        <section className="section-padding border-y border-border bg-off-white"><div className="container-main grid grid-cols-1 gap-6 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="border-t-4 border-saffron bg-white p-5"><h2 className="text-xl font-bold">Location profile</h2><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-muted-fg">Capital</dt><dd className="font-bold">{location.capital}</dd></div><div><dt className="text-muted-fg">Region</dt><dd className="font-bold">{location.region}</dd></div><div><dt className="text-muted-fg">Prototype opportunity count</dt><dd className="font-bold">{items.length}</dd></div></dl></aside>
          <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-royal"><Building2 size={16} aria-hidden="true" /> Investment themes</p><h2 className="mt-2 text-3xl font-bold">Key sectors and idea highlight</h2><div className="mt-4 flex flex-wrap gap-2">{location.keySectors.map((item) => <span key={item} className="border border-border bg-white px-3 py-2 text-sm font-semibold">{item}</span>)}</div><p className="mt-5 flex items-start gap-2 text-sm text-muted-fg"><MapPin className="mt-0.5 shrink-0 text-saffron" size={18} aria-hidden="true" /> {location.ideaHighlight}</p></div>
        </div></section>
        <section className="section-padding"><div className="container-main"><p className="text-xs font-bold uppercase tracking-wider text-royal">Illustrative Prototype Data</p><h2 className="mt-2 text-3xl font-bold">Opportunities in {location.name}</h2>{items.length ? <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{items.map((item) => <OpportunityCard key={item.id} opportunity={item} />)}</div> : <div className="mt-6 border border-border bg-off-white p-6"><h3 className="text-lg font-bold">No illustrative opportunities have been added for this location yet.</h3><p className="mt-2 text-sm text-muted-fg">The location remains part of the national directory. Return to the map or explore all prototype opportunities.</p></div>}<div className="mt-8 flex flex-wrap gap-3"><Link to="/bharat-investment-grid#india-map" className="inline-flex min-h-11 items-center gap-2 border border-navy-deep px-4 py-2 font-bold text-navy-deep"><ArrowLeft size={16} /> Back to India map</Link><Link to="/bharat-investment-grid#opportunities" className="inline-flex min-h-11 items-center bg-navy-deep px-4 py-2 font-bold text-white">Explore all opportunities</Link></div></div></section>
      </main>
    </>
  )
}
