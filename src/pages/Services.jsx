import data from '../../content/services.json'
import PageHero from '../components/blocks/PageHero'
import SectionIntro from '../components/blocks/SectionIntro'
import CtaBanner from '../components/blocks/CtaBanner'
import Card from '../components/ui/Card'
import SectionHeading from '../components/ui/SectionHeading'

export default function Services() {
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
          <h2 className="mb-4 font-serif text-xl font-bold text-navy-deep">{data.jointVenture.heading}</h2>
          {data.jointVenture.paragraphs.map((p, i) => (
            <p key={i} className="mb-4 text-muted-fg last:mb-0">{p}</p>
          ))}
        </div>
      </section>
      <section className="section-padding border-b border-border">
        <div className="container-main">
          <SectionHeading eyebrow={data.coreServices.eyebrow} title={data.coreServices.heading} />
          <div className="grid gap-4 md:grid-cols-3">
            {data.coreServices.items.map((s) => (
              <Card key={s.title} accent="royal">
                <h3 className="mb-2 font-serif text-base font-bold text-navy-deep">{s.title}</h3>
                <p className="text-sm text-muted-fg">{s.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <CtaBanner {...data.cta} />
    </>
  )
}
