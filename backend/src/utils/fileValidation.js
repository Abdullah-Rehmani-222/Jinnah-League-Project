// Upload allow-list. Extension, declared MIME type AND the file's magic bytes must all agree.
// SVG is intentionally excluded (it can carry scripts). Executables/archives are never allowed.
const startsWith = (buf, bytes, offset = 0) => bytes.every((b, i) => buf[offset + i] === b)
const ascii = (buf, str, offset = 0) => buf.subarray(offset, offset + str.length).toString('latin1') === str

export const ALLOWED = {
  'image/jpeg': { exts: ['.jpg', '.jpeg'], kind: 'IMAGE', check: (b) => startsWith(b, [0xff, 0xd8, 0xff]) },
  'image/png': { exts: ['.png'], kind: 'IMAGE', check: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) },
  'image/gif': { exts: ['.gif'], kind: 'IMAGE', check: (b) => ascii(b, 'GIF87a') || ascii(b, 'GIF89a') },
  'image/webp': { exts: ['.webp'], kind: 'IMAGE', check: (b) => ascii(b, 'RIFF') && ascii(b, 'WEBP', 8) },
  'image/avif': { exts: ['.avif'], kind: 'IMAGE', check: (b) => ascii(b, 'ftyp', 4) && (ascii(b, 'avif', 8) || ascii(b, 'avis', 8)) },
  'image/x-icon': { exts: ['.ico'], kind: 'IMAGE', check: (b) => startsWith(b, [0, 0, 1, 0]) },
  'application/pdf': { exts: ['.pdf'], kind: 'DOCUMENT', check: (b) => ascii(b, '%PDF-') },
}
// Browsers send either of these for .ico
const MIME_ALIASES = { 'image/vnd.microsoft.icon': 'image/x-icon' }

export const extensionOf = (name = '') => {
  const i = name.lastIndexOf('.')
  return i === -1 ? '' : name.slice(i).toLowerCase()
}

/** Returns { ok, mime, ext, kind } or { ok:false, reason }. */
export function inspectUpload({ originalName, mimeType, buffer }) {
  const mime = MIME_ALIASES[mimeType] ?? mimeType
  const rule = ALLOWED[mime]
  if (!rule) return { ok: false, reason: `File type "${mimeType}" is not allowed.` }
  const ext = extensionOf(originalName)
  if (!rule.exts.includes(ext)) return { ok: false, reason: `File extension "${ext || '(none)'}" does not match its type.` }
  if (!buffer?.length || !rule.check(buffer)) return { ok: false, reason: 'File content does not match its declared type.' }
  return { ok: true, mime, ext: rule.exts[0], kind: rule.kind }
}
