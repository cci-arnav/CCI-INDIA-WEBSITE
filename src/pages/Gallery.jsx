import data from '../../content/gallery.json'
import PageHero from '../components/blocks/PageHero'
import SectionIntro from '../components/blocks/SectionIntro'
import CtaBanner from '../components/blocks/CtaBanner'
import SectionHeading from '../components/ui/SectionHeading'

function PhotoCard({ photo }) {
  return (
    <div className="border border-border bg-white">
      <div className="relative aspect-[4/3] bg-navy-deep">
        <img
          src={photo.image}
          alt={photo.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'flex'
          }}
        />
        <div className="absolute inset-0 hidden flex-col items-center justify-center bg-navy-deep p-4 text-center text-white/70" style={{ display: 'none' }}>
          <span className="text-xs uppercase tracking-wider">Photo coming soon</span>
          <span className="mt-1 text-[10px] opacity-60">{photo.image}</span>
        </div>
        <span className="absolute left-3 top-3 border border-white/30 bg-navy-deep/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-saffron">
          {photo.badge}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-serif text-sm font-bold text-navy-deep">{photo.title}</h3>
        <p className="text-xs text-muted-fg">{photo.location}</p>
      </div>
    </div>
  )
}

export default function Gallery() {
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
          <SectionHeading eyebrow={data.videos.eyebrow} title={data.videos.heading} />
          <div className="grid gap-6 md:grid-cols-3">
            {data.videos.items.map((v) => (
              <div key={v.title} className="border border-border bg-white">
                <div className="aspect-video">
                  <iframe
                    title={v.title}
                    src={`https://www.youtube.com/embed/${v.youtubeId}`}
                    className="h-full w-full"
                    allowFullScreen
                  />
                </div>
                <p className="p-4 text-sm font-medium text-navy-deep">{v.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section-padding border-b border-border">
        <div className="container-main">
          <p className="mb-2 text-sm text-muted-fg">{data.note}</p>
          <p className="mb-6 text-xs text-muted-fg">{data.photos.caption}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.photos.items.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        </div>
      </section>
      <CtaBanner {...data.cta} />
    </>
  )
}
