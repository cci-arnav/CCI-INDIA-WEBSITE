import { ArrowLeft, ExternalLink, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getStateInvestmentProfile } from '../data/stateInvestment'

export default function StateInvestmentDetail() {
  const { stateSlug } = useParams()
  const profile = getStateInvestmentProfile(stateSlug)

  if (!profile) return (
    <main className="section-padding"><div className="container-main max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-wider text-saffron">State investment profile</p>
      <h1 className="mt-2 text-3xl font-bold">Location not found</h1>
      <p className="mt-3 text-muted-fg">This state or Union Territory is not in the current location directory.</p>
      <Link to="/states-investment" className="mt-6 inline-flex min-h-11 items-center gap-2 bg-navy-deep px-5 py-2 font-bold text-white"><ArrowLeft size={16} aria-hidden="true" /> Return to State Investment map</Link>
    </div></main>
  )

  return (
    <main>
      <header className="bg-navy-deep text-white">
        <div className="container-main grid grid-cols-1 gap-8 py-9 sm:py-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-12">
          <div>
            <nav aria-label="Breadcrumb" className="text-xs text-white/65"><Link to="/">Home</Link><span aria-hidden="true"> / </span><Link to="/states-investment">State Investment</Link><span aria-hidden="true"> / </span><span aria-current="page">{profile.name}</span></nav>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-saffron">{profile.type === 'state' ? 'State' : 'Union Territory'} · {profile.region}</p>
            <h1 className="mt-2 font-serif text-4xl font-bold leading-tight text-white sm:text-5xl">{profile.name}</h1>
            <p className="prose-copy mt-5 max-w-2xl text-base text-white/80">{profile.introduction}</p>
            <p className="mt-5 flex items-center gap-2 text-sm text-white/70"><MapPin size={16} aria-hidden="true" /> Capital: {profile.capital}</p>
            <Link to="/states-investment" className="mt-7 inline-flex min-h-11 items-center gap-2 border border-white/50 px-4 py-2 text-sm font-bold text-white hover:bg-white hover:text-navy-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"><ArrowLeft size={16} aria-hidden="true" /> Back to State Investment map</Link>
          </div>
          <figure className="min-w-0">
            <img src={profile.heroImage} alt={profile.heroImageAlt} className="aspect-[16/10] w-full object-cover" style={{ objectPosition: profile.heroImagePosition }} />
            <figcaption className="mt-2 text-xs text-white/60">{profile.imageSubject} · <a href={profile.imageCreditUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">{profile.imageCredit}</a> · <a href={profile.imageLicenseUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">{profile.imageLicense}</a></figcaption>
          </figure>
        </div>
      </header>

      <section className="section-padding border-b border-border bg-off-white"><div className="container-main grid grid-cols-1 gap-8 lg:grid-cols-[.7fr_1.3fr]">
        <aside className="border-t-4 border-saffron bg-white p-5"><p className="text-xs font-bold uppercase tracking-wider text-royal">Location profile</p><h2 className="mt-2 text-xl font-bold">Investment themes</h2><p className="prose-copy mt-3 text-sm text-muted-fg">{profile.investmentOverview}</p></aside>
        <div><p className="text-xs font-bold uppercase tracking-wider text-royal">Priority sectors</p><h2 className="mt-2 text-2xl font-bold">Existing CCI India sector themes</h2><p className="prose-copy mt-2 text-sm text-muted-fg">These themes are drawn from the website’s existing Bharat Investment Grid location profile; they are not a statement of government policy, incentives, or confirmed projects.</p><ul className="mt-5 flex flex-wrap gap-2">{profile.prioritySectors.map((sector) => <li key={sector} className="border border-border bg-white px-3 py-2 text-sm font-semibold">{sector}</li>)}</ul></div>
      </div></section>

      <section className="section-padding border-b border-border"><div className="container-main grid grid-cols-1 gap-6 md:grid-cols-2">
        <article className="border border-border p-5"><p className="text-xs font-bold uppercase tracking-wider text-royal">Infrastructure &amp; connectivity</p><h2 className="mt-2 text-xl font-bold">Further information</h2><p className="prose-copy mt-3 text-sm text-muted-fg">State-specific infrastructure, logistics, industrial-park and investment-region details have not yet been independently verified for publication.</p></article>
        <article className="border border-border p-5"><p className="text-xs font-bold uppercase tracking-wider text-royal">Policy &amp; investor resources</p><h2 className="mt-2 text-xl font-bold">Official links pending verification</h2><p className="prose-copy mt-3 text-sm text-muted-fg">Official state investment portals, policies and incentives will be linked here after CCI India verifies the current government sources. No unverified policy or incentive claims are shown.</p>{profile.officialResources.length > 0 && <ul className="mt-4 space-y-2">{profile.officialResources.map((resource) => <li key={resource.url}><a href={resource.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-royal underline">{resource.label}<ExternalLink size={14} aria-hidden="true" /></a></li>)}</ul>}</article>
      </div></section>

      <section className="section-padding bg-off-white"><div className="container-main">
        <article className="mx-auto max-w-4xl border border-border border-l-4 border-l-saffron bg-white p-6 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-royal">Official message</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-navy-deep sm:text-3xl">A Message from the Hon’ble Chief Minister</h2>
          {profile.approvedMessage && profile.chiefMinister ? <>
            <p className="mt-5 text-sm font-bold text-navy-deep">{profile.chiefMinister}, {profile.chiefMinisterDesignation}</p>
            <blockquote className="prose-copy mt-5 whitespace-pre-line text-base leading-relaxed text-muted-fg">{profile.approvedMessage}</blockquote>
            {profile.messagePublishedAt && <p className="mt-4 text-xs text-muted-fg">Published {profile.messagePublishedAt}</p>}
            {profile.messageSourceUrl && <a href={profile.messageSourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-royal underline">View official source <ExternalLink size={14} aria-hidden="true" /></a>}
          </> : <p className="prose-copy mt-5 text-base leading-relaxed text-muted-fg">The official message for {profile.name} will be added after CCI India confirms and approves the letter, attribution, source, and publication details. No statement or endorsement is attributed to the Chief Minister at this time.</p>}
        </article>
        <div className="mt-8"><Link to="/states-investment" className="inline-flex min-h-11 items-center gap-2 border border-navy-deep px-4 py-2 text-sm font-bold text-navy-deep hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-saffron"><ArrowLeft size={16} aria-hidden="true" /> Return to all states and UTs</Link></div>
      </div></section>
    </main>
  )
}
