import { api } from './api'

export const ACCEPT = '.jpg,.jpeg,.png,.gif,.webp,.avif,.ico,.pdf'

/** Uploads files one by one. Returns { uploaded: [asset], failed: [{ name, message }] }. */
export async function uploadFiles(files, { fileType } = {}) {
  const uploaded = []
  const failed = []
  for (const file of files) {
    const form = new FormData()
    form.append('file', file)
    if (fileType) form.append('fileType', fileType)
    try {
      const res = await api.upload('/media', form)
      uploaded.push(res.data)
    } catch (err) {
      failed.push({ name: file.name, message: err.fieldErrors?.().file || err.message })
    }
  }
  return { uploaded, failed }
}
