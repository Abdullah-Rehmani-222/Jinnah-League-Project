import { env } from '../../config/environment.js'
import { createLocalStorage } from './local.js'

/**
 * Storage abstraction used by the media service: { put({key, buffer, mimeType}) -> {url}, remove(key) }.
 * Swap providers with STORAGE_DRIVER; business logic never imports a provider directly.
 */
let instance
export async function getStorage() {
  if (instance) return instance
  if (env.STORAGE_DRIVER === 's3') {
    const { createS3Storage } = await import('./s3.js')
    instance = await createS3Storage({
      bucket: env.S3_BUCKET,
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      publicBaseUrl: env.S3_PUBLIC_BASE_URL,
    })
  } else {
    instance = createLocalStorage({ dir: env.UPLOAD_DIR, publicBaseUrl: env.apiPublicUrl })
  }
  return instance
}
