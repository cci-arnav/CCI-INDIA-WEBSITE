import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getCouncilBySlug } from '../lib/councils'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import CtaBanner from '../components/blocks/CtaBanner'
import CouncilVisual from '../components/councils/CouncilVisual'
import councilsData from '../../content/councils.json'

const categoryLabels = {
  sector: 'Sector & Regional Council',
  parliamentarian: 'Parliamentarian Council',
  international: 'International Business Council',
}

export default function CouncilDetail() {
  const { slug } = useParams()
  const council = getCouncilBySlug(slug)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!council) return
    document.title = `${council.name} | CCI India Councils`
    return () => { document.title = 'CCI India — Chamber of Commerce & Industry of India' }
  }, [council])

  if (!council) return <Navigate to="/councils" replace />
  const paragraphs = council.sourceStatus === 'available' && Array.isArray(council.description) ? council.description : []
  const categoryHref = council.type === 'sector' ? '/councils' : `/councils/${council.type}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return <>
    <section className="border-b border-border bg-off-white">
      <div className="container-main py-10 md:py-12">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Councils', href: '/councils' }, { label: categoryLabels[council.type], href: categoryHref }, { label: council.name }]} />
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-saffron">{categoryLabels[council.type]}</p>
        <h1 className="max-w-4xl font-serif text-3xl font-bold text-navy-deep md:text-4xl">{council.name}</h1>
      </div>
    </section>
    <section className="section-padding border-b border-border">
      <div className="container-main grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="min-w-0">
          <h2 className="mb-5 font-serif text-2xl font-bold text-navy-deep">Introduction</h2>
          {paragraphs.length ? paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 30)}`} className="mb-4 text-muted-fg last:mb-0">{paragraph}</p>) : <div className="border-l-4 border-saffron bg-off-white p-5 text-muted-fg">Additional information about this council will be published soon.</div>}
          {council.keyObjectives?.length > 0 && <section className="mt-9"><h2 className="mb-4 text-xl font-bold">Key objectives</h2><ul className="space-y-3">{council.keyObjectives.map((objective) => <li key={objective} className="flex gap-3 text-sm text-muted-fg"><span className="mt-1 text-saffron" aria-hidden="true">●</span><span>{objective}</span></li>)}</ul></section>}
          {council.legacySource && <aside className="mt-8 border border-border bg-off-white p-4 text-xs text-muted-fg"><strong className="text-navy-deep">Legacy source note:</strong> This council information was migrated from CCI India’s legacy page and was accessed on {council.sourceAccessed}. Any statistics, schemes or programme references should be treated as historical unless independently updated. <a href={council.legacySource} target="_blank" rel="noreferrer" className="text-royal underline">View source</a>.</aside>}
          <div className="mt-8 flex flex-wrap gap-4"><Link to={categoryHref} className="text-sm font-semibold text-royal hover:text-navy-deep">← Back to {council.type === 'sector' ? 'all councils' : `${council.type} councils`}</Link><button type="button" onClick={copyLink} className="inline-flex items-center gap-1.5 text-sm font-semibold text-royal hover:text-navy-deep">{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Link copied' : 'Copy link'}</button></div>
        </article>
        <aside className="lg:sticky lg:top-36 lg:self-start"><CouncilVisual council={council} /><p className="border border-t-0 border-border p-4 text-sm text-muted-fg">Image placeholder reserved for a verified {council.name} visual. Replace the council’s <code>image</code> value in the shared data file when an approved asset is available.</p></aside>
      </div>
    </section>
    <CtaBanner {...councilsData.cta} />
  </>
}
