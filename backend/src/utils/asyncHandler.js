// Wraps a controller so that any error (even async) goes to the error handler.
// Without this, we would need try/catch in every controller.
const asyncHandler = (controllerFunction) => (req, res, next) => {
  Promise.resolve(controllerFunction(req, res, next)).catch(next);
};

module.exports = asyncHandler;
