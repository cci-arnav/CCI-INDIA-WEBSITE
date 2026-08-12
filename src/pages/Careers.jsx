import { useState } from 'react'
import data from '../../content/careers.json'
import PageHero from '../components/blocks/PageHero'
import SectionIntro from '../components/blocks/SectionIntro'
import CtaBanner from '../components/blocks/CtaBanner'
import Card from '../components/ui/Card'
import SectionHeading from '../components/ui/SectionHeading'
import Button from '../components/ui/Button'

export default function Careers() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: '', message: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Thank you for your application. Our HR team will be in touch.')
    setForm({ name: '', email: '', phone: '', role: '', message: '' })
  }

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
          <SectionHeading eyebrow={data.overview.eyebrow} title={data.overview.heading} />
          <dl className="grid gap-3 sm:grid-cols-2">
            {data.overview.items.map((item) => (
              <div key={item.label} className="border border-border bg-white p-4">
                <dt className="mb-1 text-xs font-semibold uppercase tracking-wider text-saffron">{item.label}</dt>
                <dd className="text-sm text-muted-fg">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section className="section-padding border-b border-border">
        <div className="container-main">
          <SectionHeading eyebrow={data.whyApply.eyebrow} title={data.whyApply.heading} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.whyApply.items.map((item) => (
              <Card key={item.title}>
                <h3 className="mb-2 font-serif text-base font-bold text-navy-deep">{item.title}</h3>
                <p className="text-sm text-muted-fg">{item.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="section-padding border-b border-border bg-off-white">
        <div className="container-main grid gap-10 md:grid-cols-2">
          <div>
            <SectionHeading eyebrow={data.tracks.eyebrow} title={data.tracks.heading} />
            <ul className="grid grid-cols-2 gap-2">
              {data.tracks.items.map((t) => (
                <li key={t} className="border border-border bg-white px-3 py-2 text-sm text-navy-deep">{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading eyebrow={data.responsibilities.eyebrow} title={data.responsibilities.heading} />
            <ul className="space-y-2">
              {data.responsibilities.items.map((r) => (
                <li key={r} className="flex gap-2 text-sm text-muted-fg">
                  <span className="text-saffron shrink-0">•</span>{r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section className="section-padding border-b border-border">
        <div className="container-main max-w-2xl">
          <SectionHeading eyebrow={data.form.eyebrow} title={data.form.heading} description={data.form.description} />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input required type="text" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-royal" />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-royal" />
            </div>
            <input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-royal" />
            <select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-royal">
              <option value="">Select track</option>
              {data.formRoles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <textarea rows={4} placeholder="Tell us about yourself" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-royal" />
            <Button type="submit" variant="primary">Submit Application</Button>
          </form>
          <div className="mt-8 border border-border bg-off-white p-5">
            <h3 className="mb-1 font-serif font-bold text-navy-deep">{data.contactNote.heading}</h3>
            <p className="text-sm text-muted-fg">{data.contactNote.text}</p>
            <p className="mt-2 text-sm font-medium text-royal">{data.contactNote.phone}</p>
          </div>
        </div>
      </section>
      <CtaBanner {...data.cta} />
    </>
  )
}
