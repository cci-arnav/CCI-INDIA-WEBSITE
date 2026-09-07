import data from '../../content/states-investment.json'
import PageHero from '../components/blocks/PageHero'
import SectionIntro from '../components/blocks/SectionIntro'
import CtaBanner from '../components/blocks/CtaBanner'
import InteractiveStateMap from '../components/ui/InteractiveStateMap'
import SectionHeading from '../components/ui/SectionHeading'

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
            title="Explore States by Region"
            description="Click on a state to view detailed investment information. Filter by region to focus on specific areas."
          />
          <InteractiveStateMap />
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
            <p className="text-sm text-muted-fg">{region.description}</p>
          </div>
        </section>
      ))}
      <CtaBanner {...data.cta} />
    </>
  )
}
