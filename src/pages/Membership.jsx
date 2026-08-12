import data from '../../content/membership.json'
import PageHero from '../components/blocks/PageHero'
import SectionIntro from '../components/blocks/SectionIntro'
import CtaBanner from '../components/blocks/CtaBanner'
import Card from '../components/ui/Card'
import SectionHeading from '../components/ui/SectionHeading'
import Button from '../components/ui/Button'

export default function Membership() {
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
          <SectionHeading eyebrow={data.eligibility.eyebrow} title={data.eligibility.heading} />
          <div className="space-y-3">
            {data.eligibility.items.map((item, i) => (
              <p
                key={i}
                className={`border border-border bg-white p-4 text-sm ${item.emphasis ? 'border-l-4 border-l-saffron font-medium text-navy-deep' : 'text-muted-fg'}`}
              >
                {item.text}
              </p>
            ))}
          </div>
        </div>
      </section>
      <section className="section-padding border-b border-border">
        <div className="container-main">
          <SectionHeading eyebrow={data.tiers.eyebrow} title={data.tiers.heading} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.tiers.items.map((tier) => (
              <Card key={tier.name} accent="royal">
                <h3 className="mb-1 font-serif text-base font-bold text-navy-deep">{tier.name}</h3>
                {tier.fee && <p className="mb-3 text-sm text-saffron">{tier.fee}</p>}
                <Button href={tier.formHref} variant="secondary" size="sm">Download Form</Button>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="section-padding border-b border-border bg-off-white">
        <div className="container-main">
          <SectionHeading eyebrow={data.benefits.eyebrow} title={data.benefits.heading} />
          <ul className="grid gap-3 sm:grid-cols-2">
            {data.benefits.items.map((b) => (
              <li key={b} className="flex gap-2 border border-border bg-white p-4 text-sm text-muted-fg">
                <span className="text-saffron">✓</span>{b}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBanner {...data.cta} />
    </>
  )
}
