// ONE place that handles every error and sends a clean JSON response.
// It must have 4 parameters (err, req, res, next) so Express knows it is an error handler.
const AppError = require('../utils/AppError');
const env = require('../config/env');

// Converts known library errors (like bad JSON) into our AppError
const toAppError = (err) => {
  if (err instanceof AppError) return err;

  if (err.type === 'entity.parse.failed') {
    return new AppError('Invalid JSON in request body', 400);
  }
  if (err.type === 'entity.too.large') {
    return new AppError('Request body is too large', 413);
  }
  return null; // unknown error
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const appError = toAppError(err);

  // Expected error (validation, 404, ...): safe to show the message
  if (appError) {
    return res.status(appError.statusCode).json({
      success: false,
      message: appError.message,
      errors: appError.errors,
    });
  }

  // Unexpected error (a bug): log it for us, but hide details from the client
  console.error(err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
    errors: [],
    // Show the stack only while developing
    ...(env.nodeEnv === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
