import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

test('gallery local videos have unique records and playable local assets', () => {
  const content = JSON.parse(readFileSync(fileURLToPath(new URL('../content/gallery.json', import.meta.url)), 'utf8'))
  const videos = content.videos.items.filter((item) => item.url)

  assert.equal(videos.length, 3)
  assert.equal(new Set(videos.map((video) => video.url)).size, videos.length)
  for (const video of videos) {
    assert.match(video.url, /^\/videos\/[a-z0-9-]+\.mp4$/)
    const asset = fileURLToPath(new URL(`../public${video.url}`, import.meta.url))
    assert.ok(existsSync(asset), `${video.title} is missing its MP4 asset`)
  }
})

test('How CCI Can Help You carousel includes all four local videos', () => {
  const content = JSON.parse(readFileSync(fileURLToPath(new URL('../content/video.json', import.meta.url)), 'utf8'))

  assert.equal(content.items.length, 4)
  assert.equal(new Set(content.items.map((video) => video.id)).size, 4)
  assert.equal(new Set(content.items.map((video) => video.url)).size, 4)
  for (const video of content.items) {
    assert.equal(video.provider, 'local')
    const asset = fileURLToPath(new URL(`../public${video.url}`, import.meta.url))
    assert.ok(existsSync(asset), `${video.title} is missing its MP4 asset`)
  }
})
