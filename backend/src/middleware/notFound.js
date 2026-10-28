// Runs when no route matches the URL. It creates a 404 error
// and sends it to the error handler.
const AppError = require('../utils/AppError');

const notFound = (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
};

module.exports = notFound;
