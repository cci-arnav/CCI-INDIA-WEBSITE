const windowsReservedName = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i

export function safeArchivePath(entryName) {
  if (typeof entryName !== 'string' || !entryName || entryName.includes('\0') || entryName.includes('\\')) return null
  if (entryName.startsWith('/') || /^[a-zA-Z]:/.test(entryName) || entryName.startsWith('//')) return null
  const parts = entryName.split('/').map((part) => part.replace(/[. ]+$/g, ''))
  if (parts.some((part) =>
    part === '..'
    || part === '.'
    || part === ''
    || /[<>:"|?*\u0000-\u001f]/.test(part)
    || /[. ]$/.test(part)
    || windowsReservedName.test(part))) return null
  return parts
}
