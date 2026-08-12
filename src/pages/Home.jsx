import { Link } from 'react-router-dom'
import home from '../../content/home.json'
import Carousel from '../components/ui/Carousel'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import SectionHeading from '../components/ui/SectionHeading'


export default function Home() {
  const { hero, about, councils, whatWeDo, centers, news, impact } = home

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[480px] border-b border-border bg-navy-deep text-white md:min-h-[520px]">
        <div className="absolute inset-0 z-0">
          <Carousel slides={(hero && hero.heroSlides) || []} />
        </div>
        <div className="absolute inset-0 z-10 bg-black/40" aria-hidden="true" />
        <div className="container-main relative z-20 flex min-h-[480px] flex-col justify-center py-16 md:min-h-[520px]">
          <span className="mb-4 inline-block w-fit border border-white/30 px-3 py-1 text-xs uppercase tracking-wider text-white/90">
            {hero.badge}
          </span>
          <h1 className="mb-4 max-w-3xl font-serif text-3xl font-bold leading-tight text-white md:text-[42px]">
            {hero.headlineLead}
            <span className="text-saffron">{hero.headlineAccent}</span>
          </h1>
          <p className="mb-8 max-w-2xl text-sm text-white/80 md:text-base">{hero.description}</p>
          <div className="mb-10 flex flex-wrap gap-3">
            <Button href={hero.primaryCta.href} variant="accent">{hero.primaryCta.label}</Button>
            <Button href={hero.secondaryCta.href} variant="outline-light">{hero.secondaryCta.label}</Button>
          </div>
          <div className="flex flex-wrap gap-8 border-t border-white/20 pt-8">
            {hero.stats.map((s) => (
              <div key={s.label}>
                <div className="font-serif text-3xl font-bold text-white">{s.value}</div>
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
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            {about.items.map((item) => (
              <Card key={item.tag} accent="royal">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-saffron">{item.tag}</p>
                <p className="text-sm text-muted-fg">{item.text}</p>
              </Card>
            ))}
          </div>
          <div className="mb-6 flex flex-wrap gap-8">
            {about.quickStats.map((s) => (
              <div key={s.label}>
                <div className="font-serif text-2xl font-bold text-navy-deep">{s.value}</div>
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
          <img
            src="/images/four-pillars.png"
            alt="Four Pillars of CCI India's work"
            className="h-auto w-full border border-border"
          />
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
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3">
            {councils.featured.map((c) => (
              <div key={c.name} className="border border-border px-4 py-3 text-center text-sm font-medium text-navy-deep">
                {c.name}
              </div>
            ))}
          </div>
          <p className="mb-4 text-sm text-muted-fg">{councils.totalLabel}</p>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whatWeDo.flows.map((f) => (
              <Card key={f.label}>
                <h3 className="mb-2 font-serif text-base font-bold text-navy-deep">{f.label}</h3>
                <p className="text-sm text-muted-fg">{f.text}</p>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {centers.items.map((c) => (
              <Card key={c.name}>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-green">{c.focus}</span>
                <h3 className="mb-2 text-sm font-bold text-navy-deep">
                  {c.name === 'Center for Market Entry & Business Expansion' ? (
                    <Link to="/market-entry" className="transition-colors duration-200 hover:text-royal">{c.name}</Link>
                  ) : c.name}
                </h3>
                <p className="text-xs text-muted-fg">{c.blurb}</p>
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
          <div className="mb-6 divide-y divide-border border border-border bg-white">
            {news.items.map((item) => (
              <div key={item.title} className="flex items-start gap-4 px-5 py-4">
                <span className="shrink-0 border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-royal">
                  {item.type}
                </span>
                <p className="text-sm text-navy-deep">{item.title}</p>
              </div>
            ))}
          </div>
          <Button to={news.cta.href} variant="secondary">{news.cta.label}</Button>
        </div>
      </section>

      {/* Impact Stats */}
      <section id="impact" className="section-padding border-b border-border bg-navy-deep text-white">
        <div className="container-main">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-saffron">{impact.eyebrow}</p>
          <h2 className="mb-3 font-serif text-2xl font-bold text-white md:text-3xl">{impact.title}</h2>
          <p className="mb-8 max-w-3xl text-white/70">{impact.description}</p>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {impact.stats.map((s) => (
              <div key={s.label} className="border border-white/15 p-4 text-center">
                <div className="font-serif text-2xl font-bold text-saffron">
                  {s.prefix}{s.value}{s.suffix}
                </div>
                <div className="mt-1 text-xs text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
