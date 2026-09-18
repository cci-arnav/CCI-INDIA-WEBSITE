import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import councilsData from '../../content/councils.json'
import CtaBanner from '../components/blocks/CtaBanner'
import PageHero from '../components/blocks/PageHero'
import CouncilCard from '../components/councils/CouncilCard'

const categories = {
  parliamentarian: {
    data: councilsData.parliamentarianCouncils,
    title: 'Parliamentarian Councils',
    lead: 'CCI India’s parliamentarian councils provide a platform for dialogue, networking and stronger engagement between India and partner regions. Council details are published only where verified source information is available.',
  },
  international: {
    data: councilsData.internationalBusinessCouncils,
    title: 'International Business Councils',
    lead: 'CCI India’s international business councils support business dialogue, market connections and cooperation between Indian enterprise and global partners.',
  },
}

export default function CouncilCategory({ type }) {
  const [query, setQuery] = useState('')
  const category = categories[type]
  const filtered = useMemo(() => category.data.items.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase())), [category.data.items, query])
  return <>
    <PageHero eyebrow="Councils" title={category.title} lead={category.lead} breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Councils', href: '/councils' }, { label: category.title }]} />
    <section className="section-padding border-b border-border bg-off-white">
      <div className="container-main">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label htmlFor={`${type}-search`} className="mb-2 block text-sm font-semibold text-navy-deep">Search {category.title.toLowerCase()}</label>
            <input id={`${type}-search`} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by council name…" className="min-h-11 w-full border border-border bg-white px-4 text-sm outline-none focus:border-royal focus:ring-2 focus:ring-royal/20 sm:w-96" />
          </div>
          <p className="text-sm text-muted-fg" aria-live="polite">{filtered.length} council{filtered.length === 1 ? '' : 's'}</p>
        </div>
        {filtered.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((council) => <CouncilCard key={council.slug} council={council} />)}</div> : <div className="border border-dashed border-border bg-white p-10 text-center"><h2 className="mb-2 text-xl">No councils found</h2><p className="text-sm text-muted-fg">Try a different search term or <Link to="/councils" className="text-royal underline">browse all councils</Link>.</p></div>}
      </div>
    </section>
    <CtaBanner {...councilsData.cta} />
  </>
}
