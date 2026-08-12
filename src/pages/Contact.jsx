import { useState } from 'react'
import data from '../../content/contact.json'
import PageHero from '../components/blocks/PageHero'
import SectionHeading from '../components/ui/SectionHeading'
import Button from '../components/ui/Button'

function OfficeCard({ office }) {
  return (
    <div className="border border-border bg-white p-5">
      <h3 className="mb-2 font-serif text-base font-bold text-navy-deep">{office.name}</h3>
      {office.contactPerson && <p className="mb-1 text-sm text-muted-fg">{office.contactPerson}</p>}
      <p className="mb-1 text-sm text-muted-fg">{office.address}</p>
      {office.phone && <p className="text-sm font-medium text-royal">{office.phone}</p>}
    </div>
  )
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Thank you for your message. The CCI INDIA team will get back to you.')
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <>
      <PageHero {...data.hero} />
      <section className="section-padding border-b border-border">
        <div className="container-main grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Headquarters" title={data.headquarters.name} />
            <p className="mb-2 text-muted-fg">{data.headquarters.address}</p>
            <p className="font-medium text-royal">{data.headquarters.phone}</p>
            <div className="mt-8 border border-border border-l-4 border-l-saffron bg-off-white p-5">
              <h3 className="mb-1 font-serif font-bold text-navy-deep">{data.upcomingHq.title}</h3>
              <p className="mb-2 text-sm text-muted-fg">{data.upcomingHq.subtitle}</p>
              <p className="text-sm text-royal">Toll Free: {data.upcomingHq.tollFree}</p>
            </div>
          </div>
          <div>
            <SectionHeading eyebrow={data.form.eyebrow} title={data.form.heading} description={data.form.description} />
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-royal" />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-royal" />
              <input type="text" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-royal" />
              <textarea required rows={5} placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full border border-border px-4 py-2.5 text-sm outline-none focus:border-royal" />
              <Button type="submit" variant="primary">Send Message</Button>
            </form>
          </div>
        </div>
      </section>
      <section className="section-padding border-b border-border bg-off-white">
        <div className="container-main">
          <SectionHeading eyebrow="India" title="Regional Offices" />
          <div className="grid gap-4 md:grid-cols-3">
            {data.indiaOffices.map((o) => <OfficeCard key={o.name} office={o} />)}
          </div>
        </div>
      </section>
      <section className="section-padding border-b border-border">
        <div className="container-main">
          <SectionHeading eyebrow="International" title="Overseas Offices" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.overseasOffices.map((o) => <OfficeCard key={o.name} office={o} />)}
          </div>
        </div>
      </section>
      <section className="section-padding border-b border-border bg-off-white">
        <div className="container-main">
          <SectionHeading eyebrow="Departments" title="Contact by department" />
          <div className="flex flex-wrap gap-2">
            {data.departments.map((d) => (
              <span key={d} className="border border-border bg-white px-3 py-2 text-sm text-navy-deep">{d}</span>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
