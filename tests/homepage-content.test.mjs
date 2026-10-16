import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import home from '../content/home.json' with { type: 'json' }
import gallery from '../content/gallery.json' with { type: 'json' }
import voices from '../content/member-voices.json' with { type: 'json' }
import { excerptForMemberVoice, getLifeAtCCIVideos, getPublicMemberVoices } from '../src/lib/homeSections.js'

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('homepage places the editorial features between earlier content and membership CTA', async () => {
  const home = await readSource('../src/pages/Home.jsx')
  const newsSection = await readSource('../src/components/news/HomeNewsSection.jsx')
  const layout = await readSource('../src/components/layout/Layout.jsx')
  const news = home.indexOf('<HomeNewsSection')
  const life = home.indexOf('<LifeAtCCI />')
  const memberVoices = home.indexOf('<MemberVoices />')
  const main = layout.indexOf('<main')
  const footer = layout.indexOf('<Footer')

  assert.ok(news >= 0 && life > news && memberVoices > life)
  assert.ok(main >= 0 && footer > main, 'membership CTA stays in the shared footer after homepage sections')
  assert.match(newsSection, /Find the Latest Newsfeed/)
  assert.match(newsSection, /fetchPublishedNews\(\{ page: 0, limit: HOME_NEWS_LIMIT \}\)/)
  assert.match(newsSection, /to=\{`\/news\/\$\{item\.slug\}`\}/)
  assert.match(newsSection, /className="home-news__more" to=\{moreNewsHref\}/)
})

test('home news featured image only comes from an image-bearing story in the published result set', async () => {
  const { HOME_NEWS_LIMIT, selectHomeNewsImageStory } = await import('../src/lib/homeNews.js')
  const firstImageStory = { id: 'second', featured_image_url: '/approved-news.jpg' }
  assert.equal(HOME_NEWS_LIMIT, 5)
  assert.equal(selectHomeNewsImageStory([{ id: 'first' }, firstImageStory]), firstImageStory)
  assert.equal(selectHomeNewsImageStory([{ id: 'no-image' }]), null)
  assert.equal(selectHomeNewsImageStory([]), null)
})

test('homepage service and center cards use relevant local images', async () => {
  const flows = home.whatWeDo.flows
  const centers = home.centers.items

  assert.equal(flows.length, 4)
  assert.equal(centers.length, 10)
  for (const item of [...flows, ...centers]) {
    assert.ok(item.image, `${item.label || item.name} has an image`)
    assert.ok(item.imageAlt, `${item.label || item.name} has descriptive alt text`)
    await access(new URL(`../public${item.image}`, import.meta.url))
  }
  assert.deepEqual(
    flows.slice(0, 3).map((item) => item.image),
    [
      '/images/what-we-do/policy-advocacy.jpg',
      '/images/what-we-do/trade-facilitation.jpg',
      '/images/what-we-do/investment-matchmaking.jpg',
    ],
  )
  for (const item of flows.slice(0, 3)) {
    assert.ok(item.imageCreditUrl, `${item.label} has a source link`)
  }
})

test('Life at CCI uses configured playable videos and safely supports an empty source', () => {
  const videos = getLifeAtCCIVideos(gallery.videos.items)
  assert.deepEqual(videos.map((item) => item.id), [
    'member-testimonial-1',
    'member-testimonial-2',
    'member-testimonial-3',
  ])
  assert.deepEqual(getLifeAtCCIVideos([]), [])
  assert.deepEqual(getLifeAtCCIVideos([{ id: 'missing-source', title: 'Missing source' }]), [])
  assert.deepEqual(getLifeAtCCIVideos([
    { id: 'not-selected', title: 'Video', showInLifeAtCCI: false, provider: 'local', url: '/video.mp4' },
    { id: 'local-without-url', title: 'Testimonial', showInLifeAtCCI: true, provider: 'local' },
    { id: 'unsupported-provider', title: 'Testimonial', showInLifeAtCCI: true, provider: 'other', url: '/video.mp4' },
  ]), [])
})

test('member voices remain empty until a complete statement is approved and published', () => {
  assert.deepEqual(voices.items, [])
  assert.deepEqual(getPublicMemberVoices([]), [])
  assert.deepEqual(getPublicMemberVoices([
    { id: 'draft', title: 'Draft', statement: 'Test-only statement', approved: false, published: true },
    { id: 'missing', title: 'Missing statement', approved: true, published: true },
  ]), [])

  const fixture = { id: 'test-fixture', title: 'Test fixture', statement: 'x'.repeat(301), approved: true, published: true }
  assert.deepEqual(getPublicMemberVoices([fixture]), [fixture])
  assert.equal(excerptForMemberVoice(fixture).length, 298)
  assert.equal(excerptForMemberVoice({ statement: 'Full content', excerpt: 'Approved excerpt' }), 'Approved excerpt')
})

test('prose justification is scoped and relaxed at mobile width', async () => {
  const css = await readSource('../src/index.css')
  assert.match(css, /\.prose-copy\s*\{[^}]*text-align:\s*justify/s)
  assert.match(css, /@media\s*\(max-width:\s*639px\)\s*\{[^}]*\.prose-copy\s*\{[^}]*text-align:\s*left/s)
  assert.doesNotMatch(css, /(?:^|\n)\s*p\s*\{[^}]*text-align:\s*justify/s)
})
