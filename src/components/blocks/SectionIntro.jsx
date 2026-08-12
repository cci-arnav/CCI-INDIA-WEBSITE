import SectionHeading from '../ui/SectionHeading'

export default function SectionIntro({ eyebrow, heading, lead, paragraphs, className = '' }) {
  return (
    <div className={className}>
      <SectionHeading eyebrow={eyebrow} title={heading} description={lead} />
      {paragraphs?.map((p, i) => (
        <p key={i} className="mb-4 text-muted-fg last:mb-0">
          {p}
        </p>
      ))}
    </div>
  )
}
