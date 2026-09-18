import { access, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const data = JSON.parse(await readFile(path.join(root, 'content/councils.json'), 'utf8'))
const attributions = JSON.parse(
  await readFile(path.join(root, 'content/council-image-attributions.json'), 'utf8'),
)
const councils = [
  ...data.sectorCouncils.items,
  ...data.parliamentarianCouncils.items,
  ...data.internationalBusinessCouncils.items,
]
const errors = []
const imagePaths = new Set()

for (const council of councils) {
  const expected = `/assets/councils/${council.slug}.webp`
  if (council.image !== expected) errors.push(`${council.slug}: image must be ${expected}`)
  if (!council.imageAlt?.trim()) errors.push(`${council.slug}: missing imageAlt`)
  if (imagePaths.has(council.image)) errors.push(`${council.slug}: duplicate local image path`)
  imagePaths.add(council.image)

  const attribution = attributions[council.slug]
  if (!attribution) {
    errors.push(`${council.slug}: missing attribution record`)
    continue
  }
  for (const field of ['title', 'sourcePage', 'creator', 'license', 'localPath']) {
    if (!attribution[field]?.toString().trim()) errors.push(`${council.slug}: missing attribution ${field}`)
  }
  if (attribution.localPath !== expected) errors.push(`${council.slug}: attribution path mismatch`)
  if (attribution.width !== 1280 || attribution.height !== 720) {
    errors.push(`${council.slug}: expected 1280x720, got ${attribution.width}x${attribution.height}`)
  }

  const filePath = path.join(root, 'public', ...expected.split('/').filter(Boolean))
  try {
    await access(filePath)
    const file = await stat(filePath)
    if (file.size > 270_000) errors.push(`${council.slug}: image exceeds 270 KB (${file.size} bytes)`)
    if (file.size !== attribution.bytes) errors.push(`${council.slug}: attribution byte count is stale`)
  } catch {
    errors.push(`${council.slug}: local image file is missing`)
  }
}

for (const slug of Object.keys(attributions)) {
  if (!councils.some((council) => council.slug === slug)) errors.push(`${slug}: orphan attribution record`)
}

if (councils.length !== 111) errors.push(`expected 111 councils, found ${councils.length}`)
if (Object.keys(attributions).length !== councils.length) {
  errors.push(`expected ${councils.length} attribution records, found ${Object.keys(attributions).length}`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Validated ${councils.length} council images, alt texts, files, dimensions, and attributions.`)
}
