export function getLifeAtCCIVideos(items = []) {
  return items.filter((item) => Boolean(
    item?.showInLifeAtCCI === true
    && item?.id
    && item?.title
    && (
      (typeof item.youtubeId === 'string' && item.youtubeId.trim())
      || (item.provider === 'local' && typeof item.url === 'string' && item.url.trim())
    ),
  ))
}

export function getPublicMemberVoices(items = []) {
  return items.filter((item) => (
    item?.approved === true
    && item?.published === true
    && typeof item.title === 'string'
    && item.title.trim()
    && typeof item.statement === 'string'
    && item.statement.trim()
  ))
}

export function excerptForMemberVoice(item, limit = 300) {
  const statement = String(item?.statement || '')
  if (item?.excerpt) return item.excerpt
  return statement.length > limit ? `${statement.slice(0, limit - 3).trimEnd()}…` : statement
}
