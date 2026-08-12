import Button from '../ui/Button'

export default function CtaBanner({ title, description, primary, secondary }) {
  return (
    <section className="border-t border-border bg-off-white">
      <div className="container-main section-padding text-center">
        <h2 className="mx-auto mb-3 max-w-2xl font-serif text-2xl font-bold text-navy-deep md:text-3xl">{title}</h2>
        {description && <p className="mx-auto mb-6 max-w-2xl text-muted-fg">{description}</p>}
        <div className="flex flex-wrap justify-center gap-3">
          {primary && <Button to={primary.href} variant="primary">{primary.label}</Button>}
          {secondary && <Button to={secondary.href} variant="secondary">{secondary.label}</Button>}
        </div>
      </div>
    </section>
  )
}