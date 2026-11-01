const date = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' })
const dateTime = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' })

export const formatDate = (v) => (v ? date.format(new Date(v)) : '—')
export const formatDateTime = (v) => (v ? dateTime.format(new Date(v)) : '—')

export function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export const slugify = (s = '') =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 150)

/** Media objects come as { fileUrl } from list/detail endpoints and { url } from /settings. */
export const assetUrl = (a) => a?.fileUrl ?? a?.url ?? ''
export const isImageAsset = (a) => {
  const mime = a?.mimeType
  if (mime) return mime.startsWith('image/')
  return /\.(png|jpe?g|gif|webp|avif|ico)$/i.test(assetUrl(a))
}
