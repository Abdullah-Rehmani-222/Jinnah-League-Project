import { ApiError } from '../utils/ApiError.js'

/** validate({ params, query, body }) — parsed data is placed on req.valid (req.query is read-only in Express 5). */
export const validate = (schemas) => (req, _res, next) => {
  const errors = []
  req.valid = {}
  for (const part of ['params', 'query', 'body']) {
    if (!schemas[part]) continue
    const result = schemas[part].safeParse(req[part] ?? {})
    if (result.success) req.valid[part] = result.data
    else
      for (const issue of result.error.issues)
        errors.push({ location: part, field: issue.path.join('.'), message: issue.message })
  }
  next(errors.length ? ApiError.validation('Validation failed.', errors) : undefined)
}
