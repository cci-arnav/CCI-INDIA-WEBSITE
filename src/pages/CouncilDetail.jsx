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
  const paragraphs = council.sourceStatus !== 'unavailable' && Array.isArray(council.description) ? council.description : []
  const categoryHref = council.type === 'sector' ? '/councils' : `/councils/${council.type}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return <>
    <section className="relative min-h-[240px] overflow-hidden border-b border-border bg-navy-deep sm:min-h-[280px] md:min-h-[360px]">
      <CouncilVisual council={council} eager className="absolute inset-0 h-full max-h-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/75 to-navy-deep/20" aria-hidden="true" />
      <div className="container-main relative flex min-h-[240px] flex-col justify-center py-8 sm:min-h-[280px] sm:py-10 md:min-h-[360px] md:py-12">
        <Breadcrumbs inverse items={[{ label: 'Home', href: '/' }, { label: 'Councils', href: '/councils' }, { label: categoryLabels[council.type], href: categoryHref }, { label: council.name }]} />
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-saffron">{categoryLabels[council.type]}</p>
        <h1 className="max-w-3xl font-serif text-2xl font-bold text-white sm:text-3xl md:text-5xl">{council.name}</h1>
      </div>
    </section>
    <section className="section-padding border-b border-border">
      <div className="container-main max-w-4xl">
        <article>
          <h2 className="mb-4 font-serif text-xl font-bold text-navy-deep sm:mb-5 sm:text-2xl">Introduction</h2>
          {paragraphs.length ? paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 30)}`} className="mb-4 text-sm text-muted-fg last:mb-0 sm:text-base">{paragraph}</p>) : <div className="border-l-4 border-saffron bg-off-white p-4 text-sm text-muted-fg sm:p-5">Additional information about this council will be published soon.</div>}
          {council.keyObjectives?.length > 0 && <section className="mt-8 sm:mt-9"><h2 className="mb-3 text-lg font-bold sm:mb-4 sm:text-xl">Key objectives</h2><ul className="space-y-2 sm:space-y-3">{council.keyObjectives.map((objective) => <li key={objective} className="flex gap-3 text-xs text-muted-fg sm:text-sm"><span className="mt-1 text-saffron" aria-hidden="true">●</span><span>{objective}</span></li>)}</ul></section>}
          {council.sourceStatus === 'curated' && <aside className="mt-6 border-l-4 border-royal bg-off-white p-4 text-xs leading-relaxed text-muted-fg sm:mt-8 sm:p-5"><strong className="text-navy-deep">About this profile:</strong> This overview is curated from official bilateral and regional sources to provide context for the council’s areas of engagement. It does not represent a record of completed CCI India activity.</aside>}
          {council.sources?.length > 0 && <section className="mt-6"><h2 className="mb-2 text-sm font-bold text-navy-deep">Official references</h2><ul className="space-y-2">{council.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-xs font-semibold text-royal underline underline-offset-4 hover:text-navy-deep">{source.label}<span className="sr-only"> (opens in a new tab)</span></a></li>)}</ul></section>}
          <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4"><Link to={categoryHref} className="text-xs font-semibold text-royal hover:text-navy-deep sm:text-sm">← Back to {council.type === 'sector' ? 'all councils' : `${council.type} councils`}</Link><button type="button" onClick={copyLink} className="inline-flex items-center gap-1.5 text-xs font-semibold text-royal hover:text-navy-deep sm:text-sm">{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Link copied' : 'Copy link'}</button></div>
        </article>
      </div>
    </section>
    <CtaBanner {...councilsData.cta} />
  </>
}
