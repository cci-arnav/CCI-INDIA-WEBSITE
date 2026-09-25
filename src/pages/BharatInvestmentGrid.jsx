import { useMemo, useRef, useState } from 'react'
import { ArrowRight, BarChart3, Compass, GitCompareArrows, Search, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import BIGMap from '../components/big/BIGMap'
import DemoModal from '../components/big/DemoModal'
import OpportunityCard from '../components/big/OpportunityCard'
import { getOpportunityCount, locations, opportunities, regions, sectors } from '../data/bharatInvestmentGrid'

const popularSearches = ['Renewable Energy', 'Infrastructure', 'Manufacturing', 'Technology', 'Tourism', 'Logistics', 'Healthcare']
const sectorChoices = ['Infrastructure', 'Renewable Energy', 'Manufacturing', 'Technology', 'Healthcare', 'Agriculture', 'Food Processing', 'Tourism', 'Logistics', 'Textiles', 'Automotive', 'Electronics', 'Semiconductors', 'Pharmaceuticals', 'Green Hydrogen', 'EV & Mobility']

const normalize = (value) => value.toLowerCase().trim()

export default function BharatInvestmentGrid() {
  const opportunityRef = useRef(null)
  const mapRef = useRef(null)
  const [query, setQuery] = useState('')
  const [sector, setSector] = useState('')
  const [region, setRegion] = useState('')
  const [stage, setStage] = useState('')
  const [size, setSize] = useState('')
  const [directoryQuery, setDirectoryQuery] = useState('')
  const [directoryType, setDirectoryType] = useState('')
  const [directoryRegion, setDirectoryRegion] = useState('')
  const [submitOpen, setSubmitOpen] = useState(false)

  const filteredOpportunities = useMemo(() => opportunities.filter((item) => {
    const place = locations.find((location) => location.slug === item.stateSlug)
    const haystack = normalize([item.name, item.description, item.sector, place?.name, place?.region].join(' '))
    return (!query || haystack.includes(normalize(query))) && (!sector || item.sector === sector) && (!region || place?.region === region) && (!stage || item.projectStage === stage) && (!size || item.investmentSize === size)
  }), [query, sector, region, stage, size])

  const filteredLocations = useMemo(() => locations.filter((item) => {
    const haystack = normalize([item.name, item.region, item.keySectors.join(' '), item.ideaHighlight].join(' '))
    return (!directoryQuery || haystack.includes(normalize(directoryQuery))) && (!directoryType || item.type === directoryType) && (!directoryRegion || item.region === directoryRegion)
  }), [directoryQuery, directoryType, directoryRegion])

  const stages = [...new Set(opportunities.map((item) => item.projectStage))].sort()
  const sizes = [...new Set(opportunities.map((item) => item.investmentSize))].sort()
  const goToResults = () => opportunityRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const chooseSector = (value) => { setSector(value); setQuery(''); window.setTimeout(goToResults, 0) }
  const chooseRegion = (value) => { setRegion(value); window.setTimeout(goToResults, 0) }
  const resetOpportunities = () => { setQuery(''); setSector(''); setRegion(''); setStage(''); setSize('') }

  const regionStats = regions.map((name) => {
    const regionLocations = locations.filter((item) => item.region === name)
    const slugs = new Set(regionLocations.map((item) => item.slug))
    const regionOpportunities = opportunities.filter((item) => slugs.has(item.stateSlug))
    const keySectors = [...new Set(regionLocations.flatMap((item) => item.keySectors))].slice(0, 3)
    return { name, locationCount: regionLocations.length, opportunityCount: regionOpportunities.length, keySectors }
  })

  return (
    <div className="big-page">
      <section className="big-landing-hero relative overflow-hidden bg-navy-deep text-white">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-saffron via-white to-green" aria-hidden="true" />
        <div className="container-main relative z-[1] grid grid-cols-1 gap-9 py-12 md:py-16 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-saffron">A Flagship CCI India Initiative</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">BHARAT INVESTMENT GRID</h1>
            <p className="mt-3 text-xl font-semibold text-white/95 sm:text-2xl">Discover Investment Opportunities Across India</p>
            <p className="mt-4 max-w-2xl text-sm text-white/75 sm:text-base">Explore investment opportunities across States and Union Territories, sectors and regions through a unified national discovery platform.</p>
            <p className="mt-5 font-serif text-lg font-bold text-saffron">One India. Many Opportunities.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={goToResults} className="min-h-11 w-full bg-saffron px-5 py-2.5 font-bold text-navy-deep hover:bg-white sm:w-auto">Explore Opportunities</button>
              <button type="button" onClick={() => mapRef.current?.scrollIntoView({ behavior: 'smooth' })} className="min-h-11 w-full border border-white/50 px-5 py-2.5 font-bold text-white hover:bg-white hover:text-navy-deep sm:w-auto">Explore the Map</button>
            </div>
          </div>
          <div className="border border-white/20 bg-white/5 p-5 sm:p-6">
            <label htmlFor="big-hero-search" className="text-sm font-bold text-white">Find an investment opportunity</label>
            <div className="mt-2 flex bg-white">
              <Search className="ml-3 self-center text-royal" size={20} aria-hidden="true" />
              <input id="big-hero-search" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') goToResults() }} placeholder="Search by project, State/UT, sector or investment opportunity" className="min-h-12 min-w-0 flex-1 px-3 text-sm text-navy-deep outline-none" />
              <button type="button" onClick={goToResults} className="min-h-12 bg-royal px-4 font-bold text-white" aria-label="Search opportunities">Search</button>
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-white/60">Popular searches</p>
            <div className="mt-2 flex flex-wrap gap-2">{popularSearches.map((item) => <button key={item} type="button" onClick={() => chooseSector(item)} className="min-h-10 border border-white/25 px-3 text-xs font-semibold text-white hover:border-saffron hover:text-saffron">{item}</button>)}</div>
          </div>
        </div>
      </section>

      <section ref={mapRef} id="india-map" className="section-padding scroll-mt-32 border-y border-border bg-off-white">
        <div className="container-main">
          <p className="text-xs font-bold uppercase tracking-wider text-royal">Interactive India Map</p>
          <h2 className="mt-2 text-3xl font-bold">Explore Investment Opportunities Across India</h2>
          <p className="mb-7 mt-3 max-w-3xl text-sm text-muted-fg">Hover or focus a location to review its summary. On touch devices, select a location and use the Explore button. The complete directory remains available below.</p>
          <BIGMap />
          <p className="mt-4 text-xs text-muted-fg">Map path limitation: the available lightweight source represents the Jammu and Kashmir outline as a single shape. Ladakh remains fully available through the accessible directory and its dedicated route.</p>
        </div>
      </section>

      <section id="directory" className="section-padding scroll-mt-32 border-b border-border">
        <div className="container-main">
          <p className="text-xs font-bold uppercase tracking-wider text-royal">National Directory</p>
          <h2 className="mt-2 text-3xl font-bold">Explore by State &amp; Union Territory</h2>
          <div className="mt-6 grid grid-cols-1 gap-3 border border-border bg-off-white p-4 md:grid-cols-4">
            <label className="text-xs font-bold text-navy-deep">Search<input value={directoryQuery} onChange={(event) => setDirectoryQuery(event.target.value)} className="field" placeholder="Name, sector or idea" /></label>
            <label className="text-xs font-bold text-navy-deep">Type<select value={directoryType} onChange={(event) => setDirectoryType(event.target.value)} className="field"><option value="">All types</option><option value="state">States</option><option value="union-territory">Union Territories</option></select></label>
            <label className="text-xs font-bold text-navy-deep">Region<select value={directoryRegion} onChange={(event) => setDirectoryRegion(event.target.value)} className="field"><option value="">All regions</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
            <div className="flex items-end"><button type="button" onClick={() => { setDirectoryQuery(''); setDirectoryType(''); setDirectoryRegion('') }} className="min-h-11 w-full border border-navy-deep px-4 text-sm font-bold text-navy-deep hover:bg-white">Clear filters</button></div>
          </div>
          <p className="mt-4 text-sm text-muted-fg" role="status">Showing {filteredLocations.length} of {locations.length} locations, sorted alphabetically.</p>
          {filteredLocations.length ? <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredLocations.map((item) => (
            <article key={item.slug} className="flex h-full flex-col border border-border bg-white p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-saffron">{item.type === 'state' ? 'State' : 'Union Territory'} · {item.region}</p>
              <h3 className="mt-1 text-xl font-bold">{item.name}</h3>
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-muted-fg">Key sectors</p><p className="mt-1 text-sm text-navy-deep">{item.keySectors.join(' · ')}</p>
              <p className="mt-3 text-sm font-bold text-royal">{getOpportunityCount(item.slug)} {getOpportunityCount(item.slug) === 1 ? 'Opportunity' : 'Opportunities'}</p>
              <p className="mt-2 text-sm text-muted-fg">{item.ideaHighlight}</p>
              <Link to={`/bharat-investment-grid/state/${item.slug}`} className="mt-auto inline-flex min-h-11 items-center gap-2 pt-4 text-sm font-bold text-royal hover:underline">Explore Opportunities <ArrowRight size={15} aria-hidden="true" /></Link>
            </article>
          ))}</div> : <div className="mt-5 border border-border bg-off-white p-6"><h3 className="font-bold">No locations found</h3><p className="text-sm text-muted-fg">Clear or adjust the directory filters to see all locations.</p></div>}
        </div>
      </section>

      <section className="section-padding border-b border-border bg-off-white">
        <div className="container-main">
          <h2 className="text-3xl font-bold">Explore by Sector</h2>
          <div className="mt-5 flex flex-wrap gap-2">{sectorChoices.map((item) => <button key={item} type="button" onClick={() => chooseSector(item)} aria-pressed={sector === item} className={`min-h-11 border px-4 text-sm font-semibold ${sector === item ? 'border-navy-deep bg-navy-deep text-white' : 'border-border bg-white text-navy-deep hover:border-royal'}`}>{item}</button>)}</div>
          {sector && <button type="button" onClick={() => setSector('')} className="mt-3 text-sm font-bold text-royal underline">Clear sector: {sector}</button>}
        </div>
      </section>

      <section className="section-padding border-b border-border">
        <div className="container-main">
          <h2 className="text-3xl font-bold">Explore by Region</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{regionStats.map((item) => <button key={item.name} type="button" onClick={() => chooseRegion(item.name)} aria-pressed={region === item.name} className={`min-h-44 border p-5 text-left ${region === item.name ? 'border-navy-deep bg-navy-deep text-white' : 'border-border bg-white hover:border-royal'}`}><span className={`block font-serif text-lg font-bold ${region === item.name ? 'text-white' : 'text-navy-deep'}`}>{item.name}</span><span className="mt-2 block text-sm">{item.locationCount} locations · {item.opportunityCount} opportunities</span><span className={`mt-3 block text-xs ${region === item.name ? 'text-white/70' : 'text-muted-fg'}`}>{item.keySectors.join(' · ')}</span></button>)}</div>
        </div>
      </section>

      <section ref={opportunityRef} id="opportunities" className="section-padding scroll-mt-32 border-b border-border bg-off-white">
        <div className="container-main">
          <p className="text-xs font-bold uppercase tracking-wider text-royal">Opportunity Discovery</p>
          <div className="flex flex-wrap items-end justify-between gap-4"><h2 className="mt-2 text-3xl font-bold">Investment Opportunities</h2><button type="button" onClick={resetOpportunities} className="min-h-11 border border-navy-deep px-4 text-sm font-bold text-navy-deep">Reset all filters</button></div>
          <div className="mt-5 grid grid-cols-1 gap-3 border border-border bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-xs font-bold">Search<input className="field" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Project or location" /></label>
            <label className="text-xs font-bold">Sector<select className="field" value={sector} onChange={(e) => setSector(e.target.value)}><option value="">All sectors</option>{sectors.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="text-xs font-bold">Region<select className="field" value={region} onChange={(e) => setRegion(e.target.value)}><option value="">All regions</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="text-xs font-bold">Stage<select className="field" value={stage} onChange={(e) => setStage(e.target.value)}><option value="">All stages</option>{stages.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="text-xs font-bold">Size<select className="field" value={size} onChange={(e) => setSize(e.target.value)}><option value="">All sizes</option>{sizes.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
          <p className="mt-4 text-sm text-muted-fg" role="status">{filteredOpportunities.length} {filteredOpportunities.length === 1 ? 'opportunity' : 'opportunities'} found.</p>
          {filteredOpportunities.length ? <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredOpportunities.map((item) => <OpportunityCard key={item.id} opportunity={item} />)}</div> : <div className="mt-5 border border-border bg-white p-6"><h3 className="font-bold">No matching opportunities</h3><p className="mt-1 text-sm text-muted-fg">Try removing a filter or resetting the complete dataset.</p></div>}
        </div>
      </section>

      <section className="section-padding bg-navy-deep text-white">
        <div className="container-main">
          <p className="text-xs font-bold uppercase tracking-wider text-saffron">National Coverage</p><h2 className="mt-2 text-3xl font-bold text-white">India Investment Landscape</h2>
          <div className="mt-7 grid grid-cols-2 gap-px bg-white/15 md:grid-cols-4">{[[28, 'States'], [8, 'Union Territories'], [sectors.length, 'Sectors'], [opportunities.length, 'Opportunities']].map(([value, label]) => <div key={label} className="bg-navy-deep p-5"><strong className="block font-serif text-3xl text-saffron">{value}</strong><span className="text-sm text-white/75">{label}</span></div>)}</div>
        </div>
      </section>

      <section className="section-padding border-b border-border">
        <div className="container-main"><h2 className="text-3xl font-bold">Why Bharat Investment Grid?</h2><div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">{[
          [Compass, 'DISCOVER', 'Find opportunities across India’s diverse regions and sectors.'], [GitCompareArrows, 'COMPARE', 'Explore opportunities across States and Union Territories.'], [Users, 'CONNECT', 'Review opportunities and express interest through one interface.'], [BarChart3, 'EXPLORE', 'Understand India’s regional investment landscape through a unified platform.'],
        ].map(([Icon, title, copy]) => <article key={title} className="border-t-4 border-royal bg-off-white p-5"><Icon className="text-saffron" aria-hidden="true" /><h3 className="mt-4 text-lg font-bold">{title}</h3><p className="mt-2 text-sm text-muted-fg">{copy}</p></article>)}</div></div>
      </section>

      <section className="section-padding bg-off-white">
        <div className="container-main grid grid-cols-1 gap-5 lg:grid-cols-2">
          <article className="border border-border bg-white p-6"><p className="text-xs font-bold uppercase tracking-wider text-royal">For Investors</p><h2 className="mt-2 text-2xl font-bold">Discover. Evaluate. Connect.</h2><p className="mt-3 text-sm text-muted-fg">Explore investment opportunities across India’s States and Union Territories through a single discovery platform.</p><ol className="mt-5 grid grid-cols-3 gap-2 text-sm font-bold"><li>01 — Discover</li><li>02 — Evaluate</li><li>03 — Connect</li></ol><button type="button" onClick={goToResults} className="mt-6 min-h-11 bg-navy-deep px-5 py-2 font-bold text-white">Explore Opportunities</button></article>
          <article className="border border-border bg-white p-6"><p className="text-xs font-bold uppercase tracking-wider text-royal">For Project Promoters</p><h2 className="mt-2 text-2xl font-bold">Showcase investment opportunities</h2><p className="mt-3 text-sm text-muted-fg">Showcase investment-ready projects and opportunities from across India.</p><ul className="mt-4 grid grid-cols-2 gap-2 text-sm"><li>Submit an Opportunity</li><li>Showcase Projects</li><li>Reach Potential Investors</li><li>Update Project Information</li></ul><button type="button" onClick={() => setSubmitOpen(true)} className="mt-6 min-h-11 bg-saffron px-5 py-2 font-bold text-navy-deep">Submit an Opportunity</button></article>
        </div>
      </section>
      <DemoModal open={submitOpen} onClose={() => setSubmitOpen(false)} mode="submit" />
    </div>
  )
}
