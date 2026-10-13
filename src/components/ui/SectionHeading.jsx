export default function SectionHeading({ eyebrow, title, titleLead, titleAccent, description, align = 'left', id }) {
  return (
    <div className={`section-heading mb-8 max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''}`} id={id}>
      {eyebrow && (
        <p className="section-heading__eyebrow">{eyebrow}</p>
      )}
      <h2 className="font-serif text-2xl font-bold leading-tight text-navy-deep sm:text-3xl md:text-[2.15rem]">
        {titleLead}
        {titleAccent && <span className="text-royal">{titleAccent}</span>}
        {title}
      </h2>
      {description && <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-fg sm:text-base">{description}</p>}
    </div>
  )
}
