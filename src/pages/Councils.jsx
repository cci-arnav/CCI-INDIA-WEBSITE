import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import data from '../../content/councils.json'
import PageHero from '../components/blocks/PageHero'
import SectionIntro from '../components/blocks/SectionIntro'
import CtaBanner from '../components/blocks/CtaBanner'
import SectionHeading from '../components/ui/SectionHeading'
import CouncilCard from '../components/councils/CouncilCard'

export default function Councils() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data.sectorCouncils.items
    return data.sectorCouncils.items.filter((c) => c.name.toLowerCase().includes(q))
  }, [query])

  return (
    <>
      <PageHero {...data.hero} />
      <section className="section-padding border-b border-border">
        <div className="container-main">
          <SectionIntro {...data.intro} />
        </div>
      </section>
      <section className="section-padding border-b border-border bg-off-white">
        <div className="container-main">
          <SectionHeading
            eyebrow={data.sectorCouncils.eyebrow}
            title={data.sectorCouncils.heading}
            description={data.sectorCouncils.description}
          />
          <input
            type="search"
            placeholder="Search councils…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mb-4 w-full max-w-md border border-border px-4 py-2.5 text-sm outline-none focus:border-royal focus:ring-1 focus:ring-royal sm:mb-6"
          />
          <p className="mb-3 text-xs text-muted-fg sm:text-sm sm:mb-4">{filtered.length} council{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((council) => (
              <CouncilCard key={council.slug} council={council} />
            ))}
          </div>
        </div>
      </section>
      <section className="section-padding border-b border-border">
        <div className="container-main grid gap-4 sm:gap-5 sm:grid-cols-2 md:grid-cols-2">
          <Link to="/councils/parliamentarian" className="group border border-border p-4 hover:border-saffron focus-visible:outline focus-visible:outline-2 focus-visible:outline-royal sm:p-6"><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-saffron">11 councils</p><h2 className="mb-2 text-lg font-bold sm:text-xl group-hover:text-royal">{data.parliamentarianCouncils.heading}</h2><p className="text-xs text-muted-fg sm:text-sm">Explore India’s bilateral and regional parliamentarian council network.</p></Link>
          <Link to="/councils/international" className="group border border-border p-4 hover:border-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-royal sm:p-6"><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-green">10 councils</p><h2 className="mb-2 text-lg font-bold sm:text-xl group-hover:text-royal">{data.internationalBusinessCouncils.heading}</h2><p className="text-xs text-muted-fg sm:text-sm">Explore CCI India’s international business council network.</p></Link>
        </div>
      </section>
      <CtaBanner {...data.cta} />
    </>
  )
}
