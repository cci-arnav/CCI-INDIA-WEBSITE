import { useMemo, useState } from 'react'
import { FileSearch, RotateCcw, Search, X } from 'lucide-react'
import data from '../../content/knowledge-papers.json'
import PageHero from '../components/blocks/PageHero'
import KnowledgePaperCard from '../components/knowledge/KnowledgePaperCard'
import { filterKnowledgePapers, getPublishedKnowledgePapers } from '../lib/knowledgePapers'

const papers = getPublishedKnowledgePapers(data)
const countries = [...new Set(papers.map((paper) => paper.country))].sort()
const regions = [...new Set(papers.map((paper) => paper.region).filter(Boolean))].sort()

export default function KnowledgePapers() {
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('')
  const filtered = useMemo(() => filterKnowledgePapers(papers, { query, country, region }), [query, country, region])
  const hasFilters = Boolean(query.trim() || country || region)
  const clearFilters = () => {
    setQuery('')
    setCountry('')
    setRegion('')
  }
  const featured = filtered.find((paper) => paper.featured)
  const regularPapers = featured ? filtered.filter((paper) => paper.id !== featured.id) : filtered

  return (
    <>
      <PageHero
        eyebrow="Research & Insights"
        title="Knowledge Papers"
        lead="Country-focused research, trade insights, market intelligence and knowledge resources published or curated by CCI India."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Knowledge Papers' }]}
      />
      <section className="section-padding bg-white">
        <div className="container-main">
          <section aria-labelledby="paper-discovery-heading">
            <h2 id="paper-discovery-heading" className="sr-only">Find knowledge papers</h2>
            <div className="border border-border bg-off-white p-4 sm:p-5">
              <div className={`grid gap-4 ${regions.length ? 'lg:grid-cols-[minmax(280px,1fr)_220px_220px]' : 'md:grid-cols-[minmax(280px,1fr)_240px]'}`}>
                <div>
                  <label htmlFor="paper-search" className="mb-1 block text-xs font-semibold text-navy-deep">Search papers</label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-fg" size={18} aria-hidden="true" />
                    <input id="paper-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title, country, topic or year" className="min-h-11 w-full border border-border bg-white py-2 pl-10 pr-11 text-sm outline-none focus:border-royal focus:ring-2 focus:ring-royal/20" />
                    {query && <button type="button" onClick={() => setQuery('')} className="absolute right-0 top-0 inline-flex min-h-11 min-w-11 items-center justify-center text-muted-fg hover:text-navy-deep" aria-label="Clear search"><X size={18} aria-hidden="true" /></button>}
                  </div>
                </div>
                <div>
                  <label htmlFor="paper-country" className="mb-1 block text-xs font-semibold text-navy-deep">Country</label>
                  <select id="paper-country" value={country} onChange={(event) => setCountry(event.target.value)} className="min-h-11 w-full border border-border bg-white px-3 text-sm text-navy-deep outline-none focus:border-royal focus:ring-2 focus:ring-royal/20">
                    <option value="">All countries</option>
                    {countries.map((name) => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>
                {regions.length > 0 && <div>
                  <label htmlFor="paper-region" className="mb-1 block text-xs font-semibold text-navy-deep">Region</label>
                  <select id="paper-region" value={region} onChange={(event) => setRegion(event.target.value)} className="min-h-11 w-full border border-border bg-white px-3 text-sm text-navy-deep outline-none focus:border-royal focus:ring-2 focus:ring-royal/20">
                    <option value="">All regions</option>
                    {regions.map((name) => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>}
              </div>
              <div className="mt-4 flex min-h-11 flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                <p className="text-sm text-muted-fg" aria-live="polite"><span className="font-semibold text-navy-deep">{filtered.length}</span> {filtered.length === 1 ? 'paper' : 'papers'}</p>
                {hasFilters && <button type="button" onClick={clearFilters} className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-semibold text-royal underline decoration-royal/30 underline-offset-4 hover:decoration-royal"><RotateCcw size={15} aria-hidden="true" />Clear all filters</button>}
              </div>
            </div>
          </section>

          {papers.length === 0 ? (
            <section className="mt-8 border border-border bg-off-white px-5 py-12 text-center sm:py-16" aria-labelledby="empty-papers-heading">
              <FileSearch className="mx-auto mb-4 text-royal" size={44} strokeWidth={1.5} aria-hidden="true" />
              <h2 id="empty-papers-heading" className="font-serif text-xl font-bold text-navy-deep sm:text-2xl">Knowledge papers will be published here soon.</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-muted-fg">This library is ready for verified CCI India research and country-focused resources as they become available.</p>
            </section>
          ) : filtered.length === 0 ? (
            <section className="mt-8 border border-border px-5 py-12 text-center" aria-labelledby="no-results-heading">
              <FileSearch className="mx-auto mb-4 text-muted-fg" size={40} strokeWidth={1.5} aria-hidden="true" />
              <h2 id="no-results-heading" className="font-serif text-xl font-bold text-navy-deep">No papers match your search.</h2>
              <p className="mt-2 text-sm text-muted-fg">Try a different term or reset the current filters.</p>
              <button type="button" onClick={clearFilters} className="mt-5 inline-flex min-h-11 items-center gap-2 bg-navy-deep px-5 py-2.5 text-sm font-medium text-white hover:bg-navy"><RotateCcw size={15} aria-hidden="true" />Clear filters</button>
            </section>
          ) : (
            <div className="mt-8 space-y-8">
              {featured && <section aria-label="Featured knowledge paper"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-saffron">Featured research</p><KnowledgePaperCard paper={featured} featured /></section>}
              {regularPapers.length > 0 && <section aria-label="Knowledge paper results" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{regularPapers.map((paper) => <KnowledgePaperCard key={paper.id} paper={paper} />)}</section>}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
