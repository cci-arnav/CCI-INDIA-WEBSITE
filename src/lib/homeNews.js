export const HOME_NEWS_LIMIT = 5

export function selectHomeNewsImageStory(items = []) {
  return items.find((item) => (
    typeof item?.featured_image_url === 'string' && item.featured_image_url.trim()
  )) || null
}
