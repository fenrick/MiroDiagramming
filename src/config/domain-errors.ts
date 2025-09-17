/**
 * Base class for application domain errors that map to HTTP responses.
 *
 * Each error exposes a machine-readable {@link code} and the HTTP
 * {@link statusCode} that should be returned to callers. Extend this
 * class to describe common failure modes and throw the concrete
 * subclasses from routes or services. The global error handler
 * serializes these errors into the standard `{ error: { message, code } }`
 * payload.
 */
export abstract class DomainError extends Error {
  /** Machine readable identifier for the error condition. */
  public readonly code: string

  /** HTTP status code associated with the error. */
  public abstract readonly statusCode: number

  protected constructor(message: string, code: string, options?: ErrorOptions) {
    super(message, options)
    this.code = code
    this.name = new.target.name
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/** 400 Bad Request domain error. */
export class BadRequestError extends DomainError {
  readonly statusCode = 400

  constructor(message: string, code = 'BAD_REQUEST', options?: ErrorOptions) {
    super(message, code, options)
  }
}

/** 401 Unauthorized domain error. */
export class UnauthorizedError extends DomainError {
  readonly statusCode = 401

  constructor(message: string, code = 'UNAUTHORIZED', options?: ErrorOptions) {
    super(message, code, options)
  }
}

/** 403 Forbidden domain error. */
export class ForbiddenError extends DomainError {
  readonly statusCode = 403

  constructor(message: string, code = 'FORBIDDEN', options?: ErrorOptions) {
    super(message, code, options)
  }
}

/** 404 Not Found domain error. */
export class NotFoundError extends DomainError {
  readonly statusCode = 404

  constructor(message: string, code = 'NOT_FOUND', options?: ErrorOptions) {
    super(message, code, options)
  }
}

/** 409 Conflict domain error. */
export class ConflictError extends DomainError {
  readonly statusCode = 409

  constructor(message: string, code = 'CONFLICT', options?: ErrorOptions) {
    super(message, code, options)
  }
}

/** 415 Unsupported Media Type domain error. */
export class UnsupportedMediaTypeError extends DomainError {
  readonly statusCode = 415

  constructor(message: string, code = 'UNSUPPORTED_MEDIA_TYPE', options?: ErrorOptions) {
    super(message, code, options)
  }
}

/** 429 Too Many Requests domain error. */
export class TooManyRequestsError extends DomainError {
  readonly statusCode = 429

  constructor(message: string, code = 'TOO_MANY_REQUESTS', options?: ErrorOptions) {
    super(message, code, options)
  }
}
