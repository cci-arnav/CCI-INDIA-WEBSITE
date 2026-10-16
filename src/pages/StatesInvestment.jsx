import { Link } from 'react-router-dom'
import data from '../../content/states-investment.json'
import PageHero from '../components/blocks/PageHero'
import SectionIntro from '../components/blocks/SectionIntro'
import CtaBanner from '../components/blocks/CtaBanner'
import BIGMap from '../components/big/BIGMap'
import SectionHeading from '../components/ui/SectionHeading'
import { locations } from '../data/bharatInvestmentGrid'

export default function StatesInvestment() {
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
            eyebrow="Interactive Map"
            title="Explore India’s States and Union Territories"
            description="Select a location on the same interactive map used in Bharat Investment Grid to open its investment profile."
          />
          <BIGMap stateRouteBase="/state-investment" navigateOnTouch />
          <p className="mt-4 text-xs text-muted-fg">The existing map geometry does not include a separate Ladakh shape. It remains available in the complete location directory below.</p>
          <details className="mt-6 border border-border bg-white">
            <summary className="min-h-12 cursor-pointer px-4 py-3 text-sm font-bold text-navy-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-saffron">Browse all 28 states and 8 Union Territories</summary>
            <nav aria-label="All state and Union Territory investment pages" className="grid grid-cols-1 gap-px bg-border p-px sm:grid-cols-2 lg:grid-cols-3">
              {locations.map((location) => <Link key={location.slug} to={`/state-investment/${location.slug}`} className="bg-white px-4 py-3 text-sm font-semibold text-navy-deep hover:text-royal focus-visible:outline focus-visible:outline-2 focus-visible:outline-saffron">{location.name}<span className="ml-2 text-xs font-normal text-muted-fg">{location.type === 'state' ? 'State' : 'Union Territory'}</span></Link>)}
            </nav>
          </details>
        </div>
      </section>
      {data.regions.map((region) => (
        <section key={region.id} className="section-padding border-b border-border even:bg-off-white">
          <div className="container-main">
            <h2 className="mb-4 font-serif text-xl font-bold text-navy-deep">{region.name}</h2>
            <div className="mb-4 flex flex-wrap gap-2">
              {region.states.map((s) => (
                <span key={s} className="border border-border px-2.5 py-1 text-xs text-navy-deep">{s}</span>
              ))}
            </div>
            <p className="prose-copy text-sm text-muted-fg">{region.description}</p>
          </div>
        </section>
      ))}
      <CtaBanner {...data.cta} />
    </>
  )
}
