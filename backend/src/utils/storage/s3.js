// S3-compatible storage (Cloudflare R2, AWS S3, Backblaze B2, MinIO, ...).
// NOTE: not exercised by the automated tests (needs real credentials) — verify with a real bucket before relying on it.
export async function createS3Storage({ bucket, region, endpoint, accessKeyId, secretAccessKey, publicBaseUrl }) {
  const { S3Client, PutObjectCommand, DeleteObjectCommand } = await import('@aws-sdk/client-s3')
  const client = new S3Client({
    region,
    endpoint,
    forcePathStyle: Boolean(endpoint),
    credentials: { accessKeyId, secretAccessKey },
  })
  const base = publicBaseUrl.replace(/\/+$/, '')
  return {
    name: 's3',
    async put({ key, buffer, mimeType }) {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      )
      return { url: `${base}/${key}` }
    },
    async remove(key) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
    },
  }
}
