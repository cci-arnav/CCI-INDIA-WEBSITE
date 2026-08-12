import { Link, Navigate, useParams } from 'react-router-dom'
import { getCouncilBySlug } from '../lib/councils'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import CtaBanner from '../components/blocks/CtaBanner'
import councilsData from '../../content/councils.json'

export default function CouncilDetail() {
  const { slug } = useParams()
  const council = getCouncilBySlug(slug)

  if (!council) {
    return <Navigate to="/councils" replace />
  }

  const paragraphs = Array.isArray(council.description) ? council.description : [council.description]

  return (
    <>
      <section className="border-b border-border bg-off-white">
        <div className="container-main py-10 md:py-12">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Councils', href: '/councils' },
              { label: council.name },
            ]}
          />
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-saffron">{council.categoryTag}</p>
          <h1 className="max-w-4xl font-serif text-2xl font-bold text-navy-deep md:text-4xl">{council.name}</h1>
        </div>
      </section>

      <section className="section-padding border-b border-border">
        <div className="container-main max-w-3xl">
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="mb-4 text-muted-fg last:mb-0">
              {paragraph}
            </p>
          ))}

          {council.keyObjectives?.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 font-serif text-xl font-bold text-navy-deep">Key Objectives</h2>
              <ul className="space-y-2">
                {council.keyObjectives.map((objective) => (
                  <li key={objective} className="flex gap-2 text-sm text-muted-fg">
                    <span className="text-saffron">•</span>
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-8">
            <Link to="/councils" className="text-sm text-royal transition-colors duration-200 hover:text-navy-deep">
              ← Back to all councils
            </Link>
          </p>
        </div>
      </section>

      <CtaBanner {...councilsData.cta} />
    </>
  )
}
