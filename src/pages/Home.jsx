import { Link } from 'react-router-dom'
import home from '../../content/home.json'
import Carousel from '../components/ui/Carousel'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import GlassCard from '../components/ui/GlassCard'
import SectionHeading from '../components/ui/SectionHeading'
import NewsFeed from '../components/news/NewsFeed'
import HelpVideo from '../components/media/HelpVideo'


export default function Home() {
  const { hero, about, councils, whatWeDo, centers, news, impact } = home

  return (
    <>
      {/* Hero */}
      <section className="home-hero relative min-h-[560px] border-b border-border bg-navy-deep text-white sm:min-h-[590px] md:min-h-[620px]">
        <div className="absolute inset-0 z-0">
          <Carousel slides={(hero && hero.heroSlides) || []} />
        </div>
        <div className="container-main home-hero__content relative z-20 flex min-h-[560px] flex-col justify-center py-12 pb-28 sm:min-h-[590px] sm:py-16 sm:pb-28 md:min-h-[620px] md:pb-20">
          <span className="home-hero__eyebrow mb-3 inline-flex w-fit items-center gap-2 border border-white/30 bg-white/[0.06] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm sm:mb-4">
            <i className="h-1.5 w-1.5 rounded-full bg-saffron" aria-hidden="true" />
            {hero.badge}
          </span>
          <h1 className="home-hero__title mb-3 max-w-3xl font-serif text-3xl font-bold leading-[1.08] text-white sm:text-4xl md:text-[50px] sm:mb-4">
            {hero.headlineLead}
            <span className="text-saffron">{hero.headlineAccent}</span>
          </h1>
          <p className="home-hero__description mb-6 max-w-2xl text-sm leading-7 text-white/80 md:text-base sm:mb-8">{hero.description}</p>
          <div className="home-hero__actions mb-8 flex flex-wrap gap-3 sm:mb-10">
            <Button href={hero.primaryCta.href} variant="accent">{hero.primaryCta.label}</Button>
            <Button href={hero.secondaryCta.href} variant="outline-light">{hero.secondaryCta.label}</Button>
          </div>
          <div className="home-hero__stats flex flex-wrap gap-4 border-t border-white/20 pt-6 sm:gap-8 sm:pt-8">
            {hero.stats.map((s, index) => (
              <div key={s.label} className="home-hero__stat min-w-[110px]" style={{ '--stat-index': index }}>
                <div className="font-serif text-2xl font-bold text-white sm:text-3xl">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="section-padding border-b border-border">
        <div className="container-main">
          <SectionHeading
            eyebrow={about.eyebrow}
            titleLead={about.titleLead}
            titleAccent={about.titleAccent}
            description={about.description}
          />
          <div className="mb-6 grid gap-4 sm:mb-8 sm:gap-6 md:grid-cols-2">
            {about.items.map((item) => (
              <GlassCard key={item.tag}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-saffron">{item.tag}</p>
                <p className="text-sm text-navy-deep font-medium">{item.text}</p>
              </GlassCard>
            ))}
          </div>
          <div className="mb-4 flex flex-wrap gap-4 sm:mb-6 sm:gap-8">
            {about.quickStats.map((s) => (
              <div key={s.label} className="min-w-[100px]">
                <div className="font-serif text-xl font-bold text-navy-deep sm:text-2xl">{s.value}</div>
                <div className="text-xs text-muted-fg">{s.label}</div>
              </div>
            ))}
          </div>
          <Button to={about.cta.href} variant="secondary">{about.cta.label}</Button>
        </div>
      </section>

      {/* Four Pillars */}
      <section id="pillars" className="section-padding border-b border-border bg-off-white">
        <div className="container-main">
          <SectionHeading eyebrow="Our Pillars" title="Four pillars of CCI India's work" />
          <div className="overflow-hidden rounded-lg border border-border">
            <img
              src="/images/four-pillars.png"
              alt="Four Pillars of CCI India's work - Policy Advocacy, Business Expansion, Networking, Business Intelligence"
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Councils Preview */}
      <section className="section-padding border-b border-border">
        <div className="container-main">
          <SectionHeading
            eyebrow={councils.eyebrow}
            titleLead={councils.titleLead}
            titleAccent={councils.titleAccent}
            description={councils.description}
          />
          <div className="mb-6 overflow-hidden rounded-lg border border-border sm:mb-8">
            <img
              src="/images/councils-visual.jpg"
              alt="CCI India Councils - 90+ sector councils representing diverse industries and regions across India"
              className="h-auto w-full object-cover"
            />
          </div>
          <div className="mb-4 grid grid-cols-2 gap-2 sm:mb-6 sm:gap-3 sm:grid-cols-3 md:grid-cols-3">
            {councils.featured.map((c) => (
              <div key={c.name} className="border border-border px-3 py-2 text-center text-xs font-medium text-navy-deep sm:px-4 sm:py-3 sm:text-sm">
                {c.name}
              </div>
            ))}
          </div>
          <p className="mb-3 text-sm text-muted-fg sm:mb-4">{councils.totalLabel}</p>
          <Button to={councils.cta.href} variant="secondary">{councils.cta.label}</Button>
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
          <div className="mb-6 overflow-hidden rounded-lg border border-border bg-gradient-to-br from-navy-deep/5 to-royal/5 p-4 text-center sm:mb-8 sm:p-8">
            <img
              src="/images/network-visual.jpg"
              alt="CCI India Network Visualization - Connected economy services and member organizations"
              className="mx-auto max-w-full object-contain sm:max-w-2xl"
            />
          </div>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whatWeDo.flows.map((f) => (
              <Card key={f.label}>
                <h3 className="mb-2 font-serif text-sm font-bold text-navy-deep sm:text-base">{f.label}</h3>
                <p className="text-xs text-muted-fg sm:text-sm">{f.text}</p>
              </Card>
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
          <div className="mb-6 overflow-hidden rounded-lg border border-border sm:mb-8">
            <img
              src="/images/centers-visual.jpg"
              alt="CCI India Centers and Initiatives - Specialized departments for market entry, business expansion, and sector-specific support"
              className="h-auto w-full object-cover"
            />
          </div>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {centers.items.map((c) => (
              <Card key={c.name}>
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-green sm:text-xs">{c.focus}</span>
                <h3 className="mb-2 text-xs font-bold text-navy-deep sm:text-sm">
                  {c.name === 'Center for Market Entry & Business Expansion' ? (
                    <Link to="/market-entry" className="transition-colors duration-200 hover:text-royal">{c.name}</Link>
                  ) : c.name}
                </h3>
                <p className="text-[11px] text-muted-fg sm:text-xs">{c.blurb}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* News & Events */}
      <section className="section-padding border-b border-border bg-off-white">
        <div className="container-main">
          <SectionHeading
            eyebrow={news.eyebrow}
            titleLead={news.titleLead}
            titleAccent={news.titleAccent}
            description={news.description}
          />
          <div className="mb-4 sm:mb-6"><NewsFeed limit={3} /></div>
          <Button to={news.cta.href} variant="secondary">{news.cta.label}</Button>
        </div>
      </section>

      <HelpVideo />

      {/* Impact Stats */}
      <section id="impact" className="section-padding border-b border-border bg-navy-deep text-white">
        <div className="container-main">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-saffron">{impact.eyebrow}</p>
          <h2 className="mb-3 font-serif text-xl font-bold text-white sm:text-2xl md:text-3xl">{impact.title}</h2>
          <p className="mb-6 max-w-3xl text-sm text-white/70 sm:mb-8">{impact.description}</p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6">
            {impact.stats.map((s) => (
              <div key={s.label} className="border border-white/15 p-3 text-center sm:p-4">
                <div className="font-serif text-lg font-bold text-saffron sm:text-2xl">
                  {s.prefix}{s.value}{s.suffix}
                </div>
                <div className="mt-1 text-[10px] text-white/60 sm:text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
