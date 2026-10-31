/** Error with an HTTP status that is safe to show to API clients. */
export class ApiError extends Error {
  constructor(status, message, errors = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
  static badRequest(msg = 'Bad request', errors) { return new ApiError(400, msg, errors) }
  static unauthorized(msg = 'Authentication required') { return new ApiError(401, msg) }
  static forbidden(msg = 'You do not have permission to do this') { return new ApiError(403, msg) }
  static notFound(msg = 'Resource not found') { return new ApiError(404, msg) }
  static conflict(msg = 'Conflict', errors) { return new ApiError(409, msg, errors) }
  static validation(msg = 'Validation failed', errors = []) { return new ApiError(422, msg, errors) }
}
