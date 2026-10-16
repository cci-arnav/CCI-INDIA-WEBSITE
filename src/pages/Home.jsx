import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Globe2, MapPin } from 'lucide-react'
import home from '../../content/home.json'
import contact from '../../content/contact.json'
import Carousel from '../components/ui/Carousel'
import Button from '../components/ui/Button'
import SectionHeading from '../components/ui/SectionHeading'
import HomeNewsSection from '../components/news/HomeNewsSection'
import HelpVideo from '../components/media/HelpVideo'
import DetailDialog from '../components/ui/DetailDialog'
import DGNote from '../components/home/DGNote'
import LifeAtCCI from '../components/home/LifeAtCCI'
import MemberVoices from '../components/home/MemberVoices'
import { allCouncils } from '../lib/councils'
import editorial from '../../content/home-editorial.json'

const FEATURED_COUNCIL_SLUGS = [
  'agriculture',
  'banking-and-finance',
  'healthcare',
  'manufacturing',
  'it-and-ites',
  'infrastructure',
]

const featuredCouncils = FEATURED_COUNCIL_SLUGS
  .map((slug) => allCouncils.find((council) => council.slug === slug))
  .filter((council) => council?.image)

export default function Home() {
  const [selectedDetail, setSelectedDetail] = useState(null)
  const { hero, about, councils, whatWeDo, centers, news, impact } = home
  const indiaPresence = [
    { name: contact.headquarters.name, location: 'New Delhi · Headquarters' },
    ...contact.indiaOffices.map((office) => ({ name: office.name, location: office.address.split(',').slice(-2).join(',').trim() })),
  ]

  return (
    <>
      <section className="home-hero" aria-label="Business, industry and international engagement">
        <Carousel slides={(hero && hero.heroSlides) || []} />
      </section>

      <section className="section-padding border-b border-border bg-white" aria-labelledby="home-intro-title">
        <div className="container-main grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-16">
          <div>
            <p className="section-heading__eyebrow">{about.eyebrow} · CCI India</p>
            <h1 id="home-intro-title" className="max-w-2xl font-serif text-3xl font-bold leading-tight text-navy-deep md:text-4xl">
              Connecting Indian enterprise with <span className="text-royal">global opportunity</span>
            </h1>
            <p className="prose-copy mt-5 max-w-2xl text-base leading-8 text-muted-fg">{about.description}</p>
            <div className="mt-7">
              <Button to={about.cta.href} variant="secondary">{about.cta.label}</Button>
            </div>
          </div>

          <div className="divide-y divide-border border-y border-border">
            {about.items.map((item, index) => (
              <article key={item.tag} className="mission-panel grid gap-2 py-5 sm:grid-cols-[8rem_1fr] sm:gap-5 sm:px-4 sm:py-6">
                <p className="mission-panel__label text-xs font-semibold text-royal">0{index + 1} / {item.tag}</p>
                <p className="prose-copy text-sm leading-7 text-navy-deep">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="impact" className="section-padding border-b border-border bg-off-white" aria-labelledby="home-milestones-title">
        <div className="container-main">
          <div className="mb-8 max-w-2xl">
            <p className="section-heading__eyebrow">{impact.eyebrow}</p>
            <h2 id="home-milestones-title" className="font-serif text-2xl font-bold text-navy-deep md:text-3xl">{impact.title}</h2>
            <p className="prose-copy mt-3 text-sm leading-7 text-muted-fg">{impact.description}</p>
          </div>
          <div className="grid border-y border-border md:grid-cols-3 md:divide-x md:divide-border">
            <div className="py-5 md:px-6 md:py-6 md:first:pl-0">
              <p className="font-serif text-4xl font-bold tracking-tight text-navy-deep">1997</p>
              <p className="mt-2 text-sm font-semibold text-navy-deep">Established</p>
              <p className="mt-1 text-xs leading-6 text-muted-fg">A chamber for Corporate India, building a platform for industry and enterprise.</p>
            </div>
            <div className="border-t border-border py-5 md:border-t-0 md:px-6 md:py-6">
              <p className="font-serif text-4xl font-bold tracking-tight text-navy-deep">90<span className="text-royal">+</span></p>
              <p className="mt-2 text-sm font-semibold text-navy-deep">Sector and regional councils</p>
              <p className="mt-1 text-xs leading-6 text-muted-fg">A broad network engaging businesses across India's industries and regions.</p>
            </div>
            <div className="border-t border-border py-5 md:border-t-0 md:px-6 md:py-6 md:last:pr-0">
              <p className="font-serif text-3xl font-bold tracking-tight text-navy-deep">India <span className="text-royal">&amp;</span> the world</p>
              <p className="mt-2 text-sm font-semibold text-navy-deep">National and international presence</p>
              <p className="mt-1 text-xs leading-6 text-muted-fg">Offices and regional representation connect CCI India to business communities at home and abroad.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Four Pillars */}
      <section id="pillars" className="section-padding border-b border-border bg-white">
        <div className="container-main">
          <SectionHeading eyebrow="Our Pillars" title="Four pillars of CCI India's work" />
          <div className="overflow-hidden border border-border">
            <img
              src="/images/four-pillars.png"
              alt="Four Pillars of CCI India's work - Policy Advocacy, Business Expansion, Networking, Business Intelligence"
              className="h-auto w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Councils Preview */}
      <section className="section-padding border-b border-border" aria-labelledby="home-councils-title">
        <div className="container-main">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="section-heading__eyebrow">{councils.eyebrow}</p>
              <h2 id="home-councils-title" className="font-serif text-2xl font-bold text-navy-deep md:text-3xl">
                {councils.titleLead}<span className="text-royal">{councils.titleAccent}</span>
              </h2>
              <p className="prose-copy mt-3 text-sm leading-7 text-muted-fg">{councils.description}</p>
            </div>
            <Link to={councils.cta.href} className="inline-flex w-fit items-center gap-2 border-b border-royal pb-1 text-sm font-semibold text-royal transition-colors hover:border-saffron hover:text-saffron focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-royal">
              {councils.cta.label}<ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {featuredCouncils.map((council) => (
              <Link key={council.slug} to={`/councils/${council.slug}`} className="group flex min-w-0 flex-col bg-white focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-royal">
                <div className="aspect-[16/9] overflow-hidden bg-off-white">
                  <img src={council.image} alt={council.imageAlt || ''} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" loading="lazy" />
                </div>
                <div className="flex min-h-14 items-center justify-between gap-3 px-4 py-3">
                  <span className="text-sm font-semibold text-navy-deep transition-colors group-hover:text-royal">{council.name}</span>
                  <ArrowUpRight size={16} className="shrink-0 text-muted-fg transition-colors group-hover:text-royal" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-fg">{councils.totalLabel}</p>
        </div>
      </section>

      <section className="section-padding border-b border-border bg-off-white" aria-labelledby="home-global-title">
        <div className="container-main">
          <div className="mb-8 max-w-2xl">
            <p className="section-heading__eyebrow">Connected across markets</p>
            <h2 id="home-global-title" className="font-serif text-2xl font-bold text-navy-deep md:text-3xl">A presence in India and beyond</h2>
            <p className="prose-copy mt-3 text-sm leading-7 text-muted-fg">CCI India's listed offices and regional representation support business engagement across domestic and international markets.</p>
          </div>
          <div className="grid gap-8 border-t border-border pt-6 md:grid-cols-2 md:gap-12">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center border border-border bg-white text-royal"><MapPin size={18} aria-hidden="true" /></span>
                <h3 className="font-serif text-lg font-bold text-navy-deep">Headquarters &amp; India offices</h3>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {indiaPresence.map((office) => (
                  <li key={office.name} className="border-l-2 border-royal/40 py-1 pl-3">
                    <p className="text-sm font-semibold text-navy-deep">{office.name}</p>
                    <p className="mt-1 text-xs text-muted-fg">{office.location}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center border border-border bg-white text-royal"><Globe2 size={18} aria-hidden="true" /></span>
                <h3 className="font-serif text-lg font-bold text-navy-deep">Overseas offices</h3>
              </div>
              <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {contact.overseasOffices.map((office) => (
                  <li key={office.name} className="flex items-start gap-2 text-sm text-navy-deep">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" aria-hidden="true" />
                    {office.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-7">
            <Button to="/contact" variant="secondary">View office details</Button>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="section-padding border-b border-border bg-off-white">
        <div className="container-main">
          <SectionHeading
            eyebrow={whatWeDo.eyebrow}
            titleLead={whatWeDo.titleLead}
            titleAccent={whatWeDo.titleAccent}
            description={whatWeDo.description.replace(' Hover a node to trace a connection.', '')}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whatWeDo.flows.map((flow, index) => (
              <button key={flow.label} type="button" className="showcase-card group text-left" onClick={() => setSelectedDetail({ ...editorial.whatWeDo[flow.label], title: flow.label, intro: flow.text, image: flow.image, imageAlt: flow.imageAlt, imageCreditLabel: flow.imageCreditLabel, imageCreditUrl: flow.imageCreditUrl })}>
                <img src={flow.image} alt={flow.imageAlt} className="showcase-card__image" loading="lazy" />
                <span className="showcase-card__content">
                  <span className="showcase-card__number">0{index + 1}</span>
                  <span className="showcase-card__title" role="heading" aria-level={3}>{flow.label}</span>
                  <span className="prose-copy showcase-card__description">{flow.text}</span>
                  <span className="showcase-card__action">Explore <ArrowUpRight size={15} aria-hidden="true" /></span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Centers & Initiatives */}
      <section id="initiatives" className="section-padding border-b border-border">
        <div className="container-main">
          <SectionHeading
            eyebrow={centers.eyebrow}
            titleLead={centers.titleLead}
            titleAccent={centers.titleAccent}
            description={centers.description}
          />
          <div className="initiative-marquee">
            <div className="initiative-marquee__track">
              {[false, true].map((isDuplicate) => (
                <div className="initiative-marquee__group" key={String(isDuplicate)} aria-hidden={isDuplicate || undefined}>
                  {centers.items.map((center, index) => (
                    <button
                      key={center.name}
                      type="button"
                      tabIndex={isDuplicate ? -1 : 0}
                      className={`initiative-card group ${index % 2 === 1 ? 'initiative-card--accent' : ''}`}
                      onPointerDown={(event) => { if (isDuplicate) event.preventDefault() }}
                      onClick={() => setSelectedDetail({ ...editorial.centers[center.name], title: center.name, intro: center.blurb })}
                    >
                      <img src={center.image} alt={center.imageAlt} className="initiative-card__image" loading="lazy" />
                      <span className="initiative-card__content">
                        <span className="initiative-card__index">
                          <span className="initiative-card__number">{String(index + 1).padStart(2, '0')}</span>
                          <span className="initiative-card__focus">{center.focus}</span>
                        </span>
                        <span className={`initiative-card__title font-serif font-bold text-navy-deep transition-colors ${index % 2 === 1 ? '' : 'group-hover:text-royal'}`} role="heading" aria-level={3}>{center.name}</span>
                        <span className="prose-copy initiative-card__description">{center.blurb}</span>
                        <span className="showcase-card__action">View details <ArrowUpRight size={16} aria-hidden="true" /></span>
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HelpVideo />
      <DGNote />

      <HomeNewsSection moreNewsHref={news.cta.href} />

      <LifeAtCCI />
      <MemberVoices />
      <DetailDialog item={selectedDetail} onClose={() => setSelectedDetail(null)} />
    </>
  )
}
