import fs from 'node:fs/promises'
import path from 'node:path'

const directoryUrl = 'https://www.cciindia.org/council.html'
const dataPath = new URL('../content/councils.json', import.meta.url)

const decode = (value) => value
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&rsquo;|&#8217;/gi, '’')
  .replace(/&ldquo;|&#8220;/gi, '“')
  .replace(/&rdquo;|&#8221;/gi, '”')
  .replace(/&#39;/g, "'")
  .replace(/&quot;/gi, '"')
  .replace(/\s+/g, ' ')
  .trim()

function extractLinks(html) {
  return [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map(([, href, label]) => ({ href, label: decode(label) }))
    .filter(({ href }) => /\.html$/i.test(href) && !['council.html', 'about.html', 'services.html'].includes(href))
}

function extractCouncilContent(html, councilName) {
  const start = html.search(/<section[^>]+class=["'][^"']*(?:single-service|section-img)/i)
  const end = html.search(/<footer\b/i)
  const body = start >= 0 ? html.slice(start, end > start ? end : undefined) : ''
  const paragraphs = [...body.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => decode(match[1]))
    .filter((text) => text.length > 70 && !text.startsWith('Business Intelligence'))
  const objectives = [...body.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) => decode(match[1]))
    .filter((text) => text.length > 20 && !/^(Home|About|Services|Councils|Membership|Gallery|News)/i.test(text))
  const headings = [...body.matchAll(/<h[34]\b[^>]*>([\s\S]*?)<\/h[34]>/gi)]
    .map((match) => decode(match[1]))
    .filter((text) => text && text.toLowerCase() !== councilName.toLowerCase())

  return {
    description: [...new Set(paragraphs)],
    keyObjectives: [...new Set(objectives)],
    sections: headings.length ? [{ heading: headings[0], paragraphs: [] }] : [],
  }
}

const cacheDir = process.env.LEGACY_CACHE_DIR
const readLegacyPage = async (fileName) => {
  if (cacheDir) return fs.readFile(path.join(cacheDir, fileName), 'utf8')
  const response = await fetch(new URL(fileName, directoryUrl))
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.text()
}

const directoryHtml = await readLegacyPage('council.html')
const links = extractLinks(directoryHtml)
const linkByName = new Map(links.map((link) => [link.label.toLowerCase(), link.href]))
const data = JSON.parse(await fs.readFile(dataPath, 'utf8'))

for (const council of data.sectorCouncils.items) {
  const href = linkByName.get(council.name.toLowerCase())
  council.image ??= null
  council.imageAlt ??= `${council.name} council at CCI India`
  if (!href) {
    council.sourceStatus = 'unavailable'
    council.description = ['Additional information about this council will be published soon.']
    council.keyObjectives = []
    continue
  }

  try {
    const url = new URL(href, directoryUrl).href
    const content = extractCouncilContent(await readLegacyPage(href), council.name)
    if (content.description.length) {
      Object.assign(council, content, {
        legacySource: url,
        sourceStatus: 'available',
        sourceAccessed: '2026-09-17',
      })
    } else {
      council.sourceStatus = 'unavailable'
      council.description = ['Additional information about this council will be published soon.']
      council.keyObjectives = []
    }
  } catch (error) {
    council.sourceStatus = 'unavailable'
    council.description = ['Additional information about this council will be published soon.']
    council.keyObjectives = []
    console.warn(`Could not import ${council.name}: ${error.message}`)
  }
}

for (const group of [data.parliamentarianCouncils, data.internationalBusinessCouncils]) {
  for (const council of group.items) {
    council.image ??= null
    council.imageAlt ??= `${council.name} at CCI India`
    const href = linkByName.get(council.name.toLowerCase())
    if (href) {
      try {
        const content = extractCouncilContent(await readLegacyPage(href), council.name)
        if (content.description.length) Object.assign(council, content, { legacySource: new URL(href, directoryUrl).href, sourceStatus: 'available', sourceAccessed: '2026-09-17' })
      } catch (error) {
        console.warn(`Could not import ${council.name}: ${error.message}`)
      }
    }
    council.sourceStatus ??= 'unavailable'
    if (council.sourceStatus !== 'available') {
      council.description = ['Additional information about this council will be published soon.']
      council.keyObjectives = []
    }
  }
}

await fs.writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`)
console.log(`Mapped ${links.length} legacy council links and updated ${dataPath.pathname}`)
