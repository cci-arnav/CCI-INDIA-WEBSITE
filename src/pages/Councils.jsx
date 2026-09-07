import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import data from '../../content/councils.json'
import PageHero from '../components/blocks/PageHero'
import SectionIntro from '../components/blocks/SectionIntro'
import CtaBanner from '../components/blocks/CtaBanner'
import SectionHeading from '../components/ui/SectionHeading'
import Card from '../components/ui/Card'

function CouncilCard({ council }) {
  return (
    <Link
      to={`/councils/${council.slug}`}
      className="group block border border-border bg-white p-5 transition-all duration-200 hover:border-royal hover:shadow-md"
    >
      <div className="mb-3 flex flex-wrap gap-1.5">
        {council.categoryTag && council.categoryTag.split(',').slice(0, 2).map((tag, idx) => (
          <span
            key={idx}
            className="inline-block border border-saffron/30 bg-saffron/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-saffron"
          >
            {tag.trim()}
          </span>
        ))}
      </div>
      <h3 className="mb-2 font-serif text-base font-bold text-navy-deep group-hover:text-royal transition-colors duration-200">
        {council.name}
      </h3>
      <p className="mb-4 text-sm text-muted-fg line-clamp-2">
        {council.description && council.description[0]}
      </p>
      <div className="flex items-center gap-1 text-xs font-medium text-royal">
        View Details
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
      </div>
    </Link>
  )
}

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
            className="mb-6 w-full max-w-md border border-border px-4 py-2.5 text-sm outline-none focus:border-royal focus:ring-1 focus:ring-royal"
          />
          <p className="mb-4 text-sm text-muted-fg">{filtered.length} council{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((council) => (
              <CouncilCard key={council.slug} council={council} />
            ))}
          </div>
        </div>
      </section>
      <section className="section-padding border-b border-border">
        <div className="container-main grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="mb-4 font-serif text-xl font-bold text-navy-deep">{data.parliamentarianCouncils.heading}</h2>
            <ul className="space-y-2">
              {data.parliamentarianCouncils.items.map((council) => (
                <li key={council.slug}>
                  <Link
                    to={`/councils/${council.slug}`}
                    className="group flex items-center justify-between border-l-2 border-saffron pl-3 text-sm text-muted-fg transition-colors duration-200 hover:text-royal hover:bg-saffron/5 py-2 pr-2"
                  >
                    <span>{council.name}</span>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-4 font-serif text-xl font-bold text-navy-deep">{data.internationalBusinessCouncils.heading}</h2>
            <ul className="space-y-2">
              {data.internationalBusinessCouncils.items.map((council) => (
                <li key={council.slug}>
                  <Link
                    to={`/councils/${council.slug}`}
                    className="group flex items-center justify-between border-l-2 border-green pl-3 text-sm text-muted-fg transition-colors duration-200 hover:text-royal hover:bg-green/5 py-2 pr-2"
                  >
                    <span>{council.name}</span>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <CtaBanner {...data.cta} />
    </>
  )
}
