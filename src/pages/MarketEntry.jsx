import data from '../../content/market-entry.json'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import SectionIntro from '../components/blocks/SectionIntro'
import CtaBanner from '../components/blocks/CtaBanner'
import Card from '../components/ui/Card'
import SectionHeading from '../components/ui/SectionHeading'
import Button from '../components/ui/Button'

export default function MarketEntry() {
  const { hero } = data

  return (
    <>
      <section className="relative border-b border-border bg-navy-deep text-white">
        <div className="container-main py-12 md:py-16">
          <Breadcrumbs items={hero.breadcrumb} />
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-saffron">{hero.eyebrow}</p>
          <h1 className="mb-3 max-w-3xl font-serif text-3xl font-bold text-white md:text-4xl">
            {hero.lead}<span className="text-saffron">{hero.accent}</span>
          </h1>
          <p className="mb-2 max-w-2xl text-sm text-white/80">{hero.subheading}</p>
          <p className="mb-6 text-xs uppercase tracking-wider text-white/50">{hero.tag}</p>
          <div className="flex flex-wrap gap-3">
            <Button to={hero.primaryCta.href} variant="accent">{hero.primaryCta.label}</Button>
            <Button href={hero.secondaryCta.href} variant="outline-light">{hero.secondaryCta.label}</Button>
          </div>
        </div>
      </section>
      <section className="section-padding border-b border-border">
        <div className="container-main">
          <SectionIntro {...data.intro} />
        </div>
      </section>
      <section id="focus" className="section-padding border-b border-border bg-off-white">
        <div className="container-main">
          <SectionHeading eyebrow={data.focusAreas.eyebrow} title={data.focusAreas.heading} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.focusAreas.items.map((item) => (
              <Card key={item.title} accent="royal">
                <h3 className="mb-2 font-serif text-base font-bold text-navy-deep">{item.title}</h3>
                <p className="text-sm text-muted-fg">{item.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="section-padding border-b border-border">
        <div className="container-main">
          <SectionHeading eyebrow={data.process.eyebrow} title={data.process.heading} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {data.process.steps.map((step, i) => (
              <div key={step.title} className="border border-border border-t-4 border-t-saffron p-5">
                <div className="mb-2 text-xs font-semibold text-muted-fg">Step {i + 1}</div>
                <h3 className="mb-2 font-serif text-base font-bold text-navy-deep">{step.title}</h3>
                <p className="text-sm text-muted-fg">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaBanner {...data.cta} />
    </>
  )
}
