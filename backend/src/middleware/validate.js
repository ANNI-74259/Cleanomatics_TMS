// Runs a Joi schema on req.body (or req.query) before the controller.
// - abortEarly: false  -> collect ALL errors, not only the first one
// - stripUnknown: true -> remove fields we did not ask for (security)
const AppError = require('../utils/AppError');

const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    return next(new AppError('Validation failed', 400, errors));
  }

  // Save the cleaned data (trimmed, defaults added, unknown fields removed)
  req[source] = value;
  next();
};

module.exports = validate;
