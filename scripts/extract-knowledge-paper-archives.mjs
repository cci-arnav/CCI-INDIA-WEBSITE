import { createHash } from 'node:crypto'
import { createReadStream, createWriteStream, statSync } from 'node:fs'
import { link, mkdir, readFile, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'
import yauzl from 'yauzl'
import { safeArchivePath } from './knowledgePaperArchiveSafety.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const privateRoot = path.join(root, 'private-knowledge-papers')
const extractionRoot = path.join(privateRoot, 'extracted')
const reportPath = path.join(privateRoot, 'extraction-manifest.json')
const maxEntryBytes = 2 * 1024 ** 3
const maxExpandedBytes = 20 * 1024 ** 3

const sha256File = async (filePath) => {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(filePath)) hash.update(chunk)
  return hash.digest('hex')
}

const openZip = (filePath) => new Promise((resolve, reject) => {
  yauzl.open(filePath, { lazyEntries: true, autoClose: false, decodeStrings: true, strictFileNames: true }, (error, zip) => {
    if (error) reject(error)
    else resolve(zip)
  })
})

const entryStream = (zip, entry) => new Promise((resolve, reject) => {
  zip.openReadStream(entry, (error, stream) => error ? reject(error) : resolve(stream))
})

const readPreviousManifest = async () => {
  try {
    return JSON.parse(await readFile(reportPath, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) return { archives: [] }
    throw error
  }
}

const archiveName = (name) => name.replace(/\.zip$/i, '').normalize('NFKD')
  .replace(/[^a-zA-Z0-9-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'archive'

const archiveFiles = (directory) => import('node:fs/promises').then(({ readdir }) =>
  readdir(directory, { withFileTypes: true }).then((entries) =>
    entries.filter((entry) => entry.isFile() && /\.zip$/i.test(entry.name))
      .map((entry) => entry.name).sort((a, b) => a.localeCompare(b))))

async function extractArchive(fileName, previous) {
  const archivePath = path.join(privateRoot, fileName)
  const archiveStat = await stat(archivePath)
  const archiveHash = await sha256File(archivePath)
  const old = previous.archives.find((item) => item.name === fileName && item.sha256 === archiveHash)
  if (old?.status === 'success' && old.files?.length) {
    const existingFilesMatch = await Promise.all(old.files.map(async (item) => {
      const target = path.join(extractionRoot, old.directory, ...item.relativePath.split('/'))
      try {
        const fileStat = statSync(target)
        return fileStat.isFile() && fileStat.size === item.sizeBytes && await sha256File(target) === item.sha256
      } catch { return false }
    }))
    if (existingFilesMatch.every(Boolean)) return { ...old, reused: true }
  }

  const directory = `${archiveName(fileName)}-${archiveHash.slice(0, 12)}`
  const outputDir = path.join(extractionRoot, directory)
  await mkdir(outputDir, { recursive: true })
  const zip = await openZip(archivePath)
  const files = []
  const errors = []
  let expandedBytes = 0
  let entriesSeen = 0

  const outcome = await new Promise((resolve) => {
    let finished = false
    const finish = (result) => {
      if (finished) return
      finished = true
      zip.close()
      resolve(result)
    }
    zip.on('error', (error) => finish({ status: 'failed', errorCode: 'ZIP_READ_ERROR', errorName: error.name }))
    zip.on('end', () => finish({ status: errors.length ? 'partial' : 'success' }))
    zip.on('entry', async (entry) => {
      entriesSeen += 1
      const isDirectory = entry.fileName.endsWith('/')
      const relativeParts = safeArchivePath(isDirectory ? entry.fileName.slice(0, -1) : entry.fileName)
      if (!relativeParts) {
        errors.push({ entry: entry.fileName, code: 'UNSAFE_ARCHIVE_PATH' })
        zip.readEntry()
        return
      }
      if (isDirectory) {
        zip.readEntry()
        return
      }
      const unixType = (entry.externalFileAttributes >>> 16) & 0o170000
      if (unixType === 0o120000 || entry.generalPurposeBitFlag & 1) {
        errors.push({ entry: entry.fileName, code: unixType === 0o120000 ? 'SYMLINK_REJECTED' : 'ENCRYPTED_ENTRY_UNSUPPORTED' })
        zip.readEntry()
        return
      }
      if (!Number.isSafeInteger(entry.uncompressedSize) || entry.uncompressedSize < 0 || entry.uncompressedSize > maxEntryBytes
        || expandedBytes + entry.uncompressedSize > maxExpandedBytes) {
        errors.push({ entry: entry.fileName, code: 'EXPANSION_LIMIT_EXCEEDED' })
        zip.readEntry()
        return
      }
      expandedBytes += entry.uncompressedSize
      const destination = path.resolve(outputDir, ...relativeParts)
      const relative = path.relative(outputDir, destination)
      if (!relative || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
        errors.push({ entry: entry.fileName, code: 'UNSAFE_RESOLVED_PATH' })
        zip.readEntry()
        return
      }
      try {
        await mkdir(path.dirname(destination), { recursive: true })
        const temporary = `${destination}.partial-${process.pid}-${entriesSeen}`
        const hash = createHash('sha256')
        let written = 0
        const source = await entryStream(zip, entry)
        source.on('data', (chunk) => {
          written += chunk.length
          hash.update(chunk)
        })
        await pipeline(source, createWriteStream(temporary, { flags: 'wx' }))
        if (written !== entry.uncompressedSize) throw new Error('ZIP_ENTRY_SIZE_MISMATCH')
        const entryHash = hash.digest('hex')
        let finalDestination = destination
        let finalRelative = relativeParts.join('/')
        try {
          await link(temporary, finalDestination)
        } catch (error) {
          if (error.code !== 'EEXIST') throw error
          const existing = await stat(finalDestination)
          if (existing.size !== written || await sha256File(finalDestination) !== entryHash) {
            const original = path.parse(destination)
            finalDestination = path.join(original.dir, `${original.name}--${entryHash.slice(0, 12)}${original.ext}`)
            finalRelative = path.relative(outputDir, finalDestination).split(path.sep).join('/')
            try {
              await link(temporary, finalDestination)
            } catch (collisionError) {
              if (collisionError.code !== 'EEXIST') throw collisionError
              const disambiguated = await stat(finalDestination)
              if (disambiguated.size !== written || await sha256File(finalDestination) !== entryHash) {
                throw new Error('DUPLICATE_ENTRY_PATH_CONFLICT')
              }
            }
          }
        }
        await unlink(temporary)
        files.push({ relativePath: finalRelative, originalPath: entry.fileName, sizeBytes: written, sha256: entryHash })
      } catch (error) {
        try { await unlink(`${destination}.partial-${process.pid}-${entriesSeen}`) } catch (cleanupError) {
          if (cleanupError.code !== 'ENOENT') errors.push({ entry: entry.fileName, code: 'TEMPORARY_FILE_CLEANUP_FAILED' })
        }
        errors.push({ entry: entry.fileName, code: /^[A-Z0-9_]{1,64}$/.test(error.message) ? error.message : 'ENTRY_EXTRACTION_FAILED' })
      }
      zip.readEntry()
    })
    zip.readEntry()
  })

  const manifestRow = {
    name: fileName,
    sizeBytes: archiveStat.size,
    sha256: archiveHash,
    directory,
    entryCount: entriesSeen,
    expandedBytes,
    files,
    errors,
    ...outcome,
  }
  if (manifestRow.status !== 'success') manifestRow.failureDetails = errors
  return manifestRow
}

await mkdir(extractionRoot, { recursive: true })
const previous = await readPreviousManifest()
const names = await archiveFiles(privateRoot)
const results = []
for (const name of names) {
  try {
    results.push(await extractArchive(name, previous))
  } catch (error) {
    results.push({ name, status: 'failed', errorCode: 'ARCHIVE_PROCESSING_FAILED', errorName: error.name })
  }
}
const report = {
  generatedAt: new Date().toISOString(),
  archiveCount: names.length,
  successfullyProcessed: results.filter((item) => item.status === 'success' || item.reused).length,
  archives: results,
}
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 })
for (const row of results) {
  console.log(JSON.stringify({
    name: row.name,
    status: row.reused ? 'reused' : row.status,
    entries: row.entryCount ?? null,
    pdfs: row.files?.filter((file) => /\.pdf$/i.test(file.relativePath)).length ?? null,
    expandedBytes: row.expandedBytes ?? null,
    errorCount: row.errors?.length ?? null,
    errorCode: row.errorCode ?? null,
  }))
}
if (!names.length) console.error('No ZIP archives found in private-knowledge-papers.')
