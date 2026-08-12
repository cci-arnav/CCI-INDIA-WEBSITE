import data from '../../content/about.json'
import PageHero from '../components/blocks/PageHero'
import SectionIntro from '../components/blocks/SectionIntro'
import CtaBanner from '../components/blocks/CtaBanner'
import Card from '../components/ui/Card'
import LeadershipPhoto from '../components/ui/LeadershipPhoto'

export default function About() {
  return (
    <>
      <PageHero {...data.hero} />
      <section className="section-padding border-b border-border">
        <div className="container-main">
          <SectionIntro {...data.intro} />
        </div>
      </section>
      <section className="section-padding border-b border-border bg-off-white">
        <div className="container-main grid gap-8 md:grid-cols-2">
          <Card accent="royal">
            <h2 className="mb-4 font-serif text-xl font-bold">{data.mission.heading}</h2>
            {data.mission.paragraphs.map((p, i) => (
              <p key={i} className="mb-3 text-sm text-muted-fg last:mb-0">{p}</p>
            ))}
          </Card>
          <Card accent="green">
            <h2 className="mb-4 font-serif text-xl font-bold">{data.vision.heading}</h2>
            {data.vision.paragraphs.map((p, i) => (
              <p key={i} className="mb-3 text-sm text-muted-fg last:mb-0">{p}</p>
            ))}
          </Card>
        </div>
      </section>
      <section className="section-padding border-b border-border">
        <div className="container-main">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-saffron">{data.leadership.eyebrow}</p>
          <h2 className="mb-8 font-serif text-2xl font-bold text-navy-deep">{data.leadership.heading}</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {data.leadership.members.map((m) => (
              <Card key={m.name} className="text-center">
                <LeadershipPhoto
                  src={m.image}
                  alt={m.name}
                  className="mx-auto mb-4 h-36 w-36 rounded-sm"
                />
                <h3 className="font-serif text-lg font-bold text-navy-deep">
                  {m.link ? (
                    <a href={m.link} target="_blank" rel="noopener noreferrer" className="transition-colors duration-200 hover:text-royal">
                      {m.name}
                    </a>
                  ) : m.name}
                </h3>
                <p className="text-sm text-muted-fg">{m.title}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <CtaBanner {...data.cta} />
    </>
  )
}
