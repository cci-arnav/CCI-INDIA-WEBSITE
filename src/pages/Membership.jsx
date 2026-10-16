import { CheckCircle2, ArrowUpRight } from 'lucide-react'
import data from '../../content/membership.json'
import PageHero from '../components/blocks/PageHero'
import CtaBanner from '../components/blocks/CtaBanner'

export default function Membership() {
  return (
    <>
      <PageHero {...data.hero} />

      {/* ── Intro Section ── */}
      <section className="section-padding border-b border-border bg-white">
        <div className="container-main">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-saffron mb-2">{data.intro.eyebrow}</p>
            <p className="prose-copy text-base leading-8 text-muted-fg">{data.intro.lead}</p>
          </div>
        </div>
      </section>

      {/* ── Membership Tiers ── */}
      <section className="section-padding border-b border-border bg-off-white">
        <div className="container-main">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-saffron mb-2">{data.tiers.eyebrow}</p>
            <h2 className="font-serif text-3xl font-bold text-navy-deep">{data.tiers.heading}</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.tiers.items.map((tier) => (
              <div key={tier.name} className="membership-tier-card">
                <h3 className="membership-tier-card__title">{tier.name}</h3>
                {tier.fee && <p className="membership-tier-card__fee">{tier.fee}</p>}
                <p className="membership-tier-card__desc">Access to networks, councils, and business opportunities</p>
                <a
                  href={tier.formHref}
                  target="_blank"
                  rel="noreferrer"
                  className="membership-tier-card__link"
                >
                  Download Form
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Eligibility Rules ── */}
      <section className="section-padding border-b border-border bg-white">
        <div className="container-main">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-saffron mb-2">{data.eligibility.eyebrow}</p>
            <h2 className="font-serif text-3xl font-bold text-navy-deep">{data.eligibility.heading}</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {data.eligibility.items.map((item, i) => (
              <div
                key={i}
                className={`membership-eligibility-item ${item.emphasis ? 'membership-eligibility-item--emphasis' : ''}`}
              >
                <div className="membership-eligibility-item__icon" aria-hidden="true">
                  <CheckCircle2 size={16} />
                </div>
                <p className="membership-eligibility-item__text">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Member Benefits ── */}
      <section className="section-padding border-b border-border bg-off-white">
        <div className="container-main">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-saffron mb-2">{data.benefits.eyebrow}</p>
            <h2 className="font-serif text-3xl font-bold text-navy-deep">{data.benefits.heading}</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.benefits.items.map((benefit) => (
              <div key={benefit} className="membership-benefit-card">
                <CheckCircle2 size={20} className="membership-benefit-card__icon" aria-hidden="true" />
                <p className="membership-benefit-card__text">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner {...data.cta} />
    </>
  )
}
