import data from '../../content/states-investment.json'
import PageHero from '../components/blocks/PageHero'
import SectionIntro from '../components/blocks/SectionIntro'
import CtaBanner from '../components/blocks/CtaBanner'

export default function StatesInvestment() {
  return (
    <>
      <PageHero {...data.hero} />
      <section className="section-padding border-b border-border">
        <div className="container-main">
          <SectionIntro {...data.intro} />
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
