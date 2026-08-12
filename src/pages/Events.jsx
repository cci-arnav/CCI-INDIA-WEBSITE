import data from '../../content/events.json'
import PageHero from '../components/blocks/PageHero'
import SectionIntro from '../components/blocks/SectionIntro'
import CtaBanner from '../components/blocks/CtaBanner'
import SectionHeading from '../components/ui/SectionHeading'

export default function Events() {
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
          <SectionHeading eyebrow={data.highlights.eyebrow} title={data.highlights.heading} />
          <div className="grid gap-8 lg:grid-cols-2">
            {data.highlights.items.map((event) => (
              <div key={event.title} className="border border-border bg-white">
                <div className="aspect-video">
                  <iframe
                    title={event.title}
                    src={`https://www.youtube.com/embed/${event.youtubeId}`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-5">
                  <h3 className="mb-2 font-serif text-lg font-bold text-navy-deep">{event.title}</h3>
                  <p className="text-sm text-muted-fg">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaBanner {...data.cta} />
    </>
  )
}
