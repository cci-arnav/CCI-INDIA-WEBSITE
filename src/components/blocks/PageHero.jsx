import Breadcrumbs from '../ui/Breadcrumbs'

export default function PageHero({ eyebrow, title, breadcrumb, lead }) {
  return (
    <section className="border-b border-border bg-off-white">
      <div className="container-main py-10 md:py-12">
        <Breadcrumbs items={breadcrumb} />
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-saffron">{eyebrow}</p>
        )}
        <h1 className="max-w-4xl font-serif text-2xl font-bold text-navy-deep md:text-4xl">{title || lead}</h1>
        {lead && title && <p className="mt-3 max-w-3xl text-muted-fg">{lead}</p>}
      </div>
    </section>
  )
}
