import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import data from '../../content/councils.json'
import PageHero from '../components/blocks/PageHero'
import SectionIntro from '../components/blocks/SectionIntro'
import CtaBanner from '../components/blocks/CtaBanner'
import SectionHeading from '../components/ui/SectionHeading'

function CouncilLink({ council }) {
  return (
    <Link
      to={`/councils/${council.slug}`}
      className="block border border-border bg-white px-3 py-2.5 text-sm text-navy-deep transition-colors duration-200 hover:border-royal hover:text-royal"
    >
      {council.name}
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
            className="mb-6 w-full max-w-md border border-border px-4 py-2.5 text-sm outline-none focus:border-royal"
          />
          <p className="mb-4 text-sm text-muted-fg">{filtered.length} council{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {filtered.map((council) => (
              <CouncilLink key={council.slug} council={council} />
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
                    className="block border-l-2 border-saffron pl-3 text-sm text-muted-fg transition-colors duration-200 hover:text-royal"
                  >
                    {council.name}
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
                    className="block border-l-2 border-green pl-3 text-sm text-muted-fg transition-colors duration-200 hover:text-royal"
                  >
                    {council.name}
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
