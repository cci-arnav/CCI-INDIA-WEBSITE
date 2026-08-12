export default function SectionHeading({ eyebrow, title, titleLead, titleAccent, description, align = 'left', id }) {
  return (
    <div className={`mb-8 max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''}`} id={id}>
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-saffron">{eyebrow}</p>
      )}
      <h2 className="font-serif text-2xl font-bold text-navy-deep md:text-3xl">
        {titleLead}
        {titleAccent && <span className="text-royal">{titleAccent}</span>}
        {title}
      </h2>
      {description && <p className="mt-3 text-muted-fg">{description}</p>}
    </div>
  )
}
