import { useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import indiaMap from '../../data/india-state-paths.json'
import { getOpportunityCount, mapLocationById } from '../../data/bharatInvestmentGrid'

export default function BIGMap() {
  const navigate = useNavigate()
  const firstMapped = mapLocationById.mh
  const [active, setActive] = useState(firstMapped)
  const [activeMapId, setActiveMapId] = useState('mh')
  const shapes = useMemo(() => indiaMap.states, [])

  const select = (shape) => {
    const location = mapLocationById[shape.id]
    if (!location) return
    setActive(location)
    setActiveMapId(shape.id)
  }

  const open = (shape) => {
    const location = mapLocationById[shape.id]
    if (location) navigate(`/bharat-investment-grid/state/${location.slug}`)
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(270px,.75fr)]">
      <div className="min-w-0 border border-border bg-white p-3 sm:p-5">
        <p className="mb-3 text-center text-xs text-muted-fg">Select a State or Union Territory. Use the directory below for an equivalent complete list.</p>
        <svg viewBox={indiaMap.viewBox} className="mx-auto block h-auto max-h-[610px] w-full max-w-[540px]" role="group" aria-labelledby="big-map-title big-map-desc">
          <title id="big-map-title">Interactive map of India</title>
          <desc id="big-map-desc">State and Union Territory shapes link to illustrative investment summaries. Tab through regions and press Enter or Space to open details.</desc>
          {shapes.map((shape) => {
            const location = mapLocationById[shape.id]
            if (!location) return null
            const count = getOpportunityCount(location.slug)
            const selected = activeMapId === shape.id || active?.slug === location.slug
            return (
              <path
                key={shape.id}
                d={shape.d}
                data-state-slug={location.slug}
                tabIndex="0"
                role="link"
                aria-label={`${location.name}, ${location.region}, ${count} illustrative ${count === 1 ? 'opportunity' : 'opportunities'}.`}
                className={`big-map-path ${selected ? 'is-active' : ''}`}
                onPointerEnter={() => select(shape)}
                onFocus={() => select(shape)}
                onPointerUp={(event) => event.pointerType === 'mouse' ? open(shape) : select(shape)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    open(shape)
                  }
                }}
              />
            )
          })}
        </svg>
        <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-muted-fg" aria-label="Map legend">
          <span className="flex items-center gap-2"><i className="h-3 w-3 border border-royal bg-[#dbe8f8]" /> Available location</span>
          <span className="flex items-center gap-2"><i className="h-3 w-3 border border-navy-deep bg-saffron" /> Selected location</span>
        </div>
      </div>

      <aside className="border-t-4 border-saffron bg-navy-deep p-5 text-white" aria-live="polite">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-saffron">{active.type === 'state' ? 'State' : 'Union Territory'}</p>
        <h3 className="mt-1 text-2xl font-bold text-white">{active.name}</h3>
        <p className="text-sm text-white/70">{active.region}</p>
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-wider text-white/60">Key sectors</p>
          <p className="mt-1 text-sm">{active.keySectors.join(' · ')}</p>
        </div>
        <p className="mt-4 text-sm font-semibold text-saffron">{getOpportunityCount(active.slug)} Illustrative {getOpportunityCount(active.slug) === 1 ? 'Opportunity' : 'Opportunities'}</p>
        <div className="mt-4 border-t border-white/15 pt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-white/60">Idea highlight</p>
          <p className="mt-1 text-sm text-white/85">{active.ideaHighlight}</p>
        </div>
        <Link to={`/bharat-investment-grid/state/${active.slug}`} className="mt-5 inline-flex min-h-11 items-center gap-2 bg-white px-4 py-2 text-sm font-bold text-navy-deep hover:bg-off-white">
          Explore {active.name} <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </aside>
    </div>
  )
}
