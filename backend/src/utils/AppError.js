// A custom error that carries an HTTP status code.
// Example: throw new AppError('Task not found', 404);
class AppError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // list of field errors (used for validation)
    this.isOperational = true; // means: "we expected this error"
  }
}

module.exports = AppError;
