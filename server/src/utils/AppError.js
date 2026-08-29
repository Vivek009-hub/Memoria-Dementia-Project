/**
 * AppError — application-level error with an HTTP status code and a
 * machine-readable error code.
 *
 * Consumed by error.middleware.js which reads:
 *   err.statusCode, err.code, err.message
 */
export class AppError extends Error {
  /**
   * @param {string} message  Human-readable description.
   * @param {number} statusCode  HTTP status code (e.g. 400, 401, 409).
   * @param {string} code  Machine-readable error code (e.g. 'UNAUTHORIZED').
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;

    // Maintain proper prototype chain in ES-module environments
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
