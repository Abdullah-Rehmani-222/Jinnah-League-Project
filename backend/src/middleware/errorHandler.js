import { env } from '../config/environment.js'
import { logger } from '../utils/logger.js'
import { ApiError } from '../utils/ApiError.js'

export const notFound = (_req, res) =>
  res.status(404).json({ success: false, message: 'Route not found.', errors: [] })

const prismaToApi = (err) => {
  switch (err.code) {
    case 'P2002': {
      const fields = [err.meta?.target ?? err.meta?.driverAdapterError?.cause?.constraint?.fields].flat().filter(Boolean)
      return new ApiError(409, 'A record with this value already exists.', fields.map((f) => ({ field: String(f), message: 'Already exists.' })))
    }
    case 'P2025': return new ApiError(404, 'Record not found.')
    case 'P2003': return new ApiError(409, 'This record is referenced by other content, or references something that does not exist.')
    case 'P2023': return new ApiError(422, 'Invalid identifier.')
    default: return null
  }
}

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  let apiErr = err instanceof ApiError ? err : null

  if (!apiErr && typeof err.code === 'string' && /^P2\d{3}$/.test(err.code)) apiErr = prismaToApi(err)
  if (!apiErr && err.name === 'MulterError')
    apiErr = err.code === 'LIMIT_FILE_SIZE'
      ? new ApiError(413, `File is too large (max ${env.MAX_UPLOAD_MB} MB).`)
      : new ApiError(422, 'Invalid file upload.')
  if (!apiErr && err.type === 'entity.too.large') apiErr = new ApiError(413, 'Request body is too large.')
  if (!apiErr && err.type === 'entity.parse.failed') apiErr = new ApiError(400, 'Malformed JSON body.')
  if (!apiErr && err.message === 'Origin not allowed by CORS') apiErr = new ApiError(403, 'Origin not allowed.')

  if (!apiErr) {
    logger.error({ err, reqId: req.id, path: req.originalUrl }, 'Unhandled error')
    apiErr = new ApiError(500, 'Something went wrong on our side. Please try again later.')
  }
  res.status(apiErr.status).json({ success: false, message: apiErr.message, errors: apiErr.errors ?? [] })
}
