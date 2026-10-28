// Form checks in the browser. They match the backend (Joi) rules,
// so the user sees the error before the request is even sent.
export function validateTask(values) {
  const errors = {};

  const title = values.title.trim();
  if (!title) errors.title = 'Title is required';
  else if (title.length < 3) errors.title = 'Title must be at least 3 characters';
  else if (title.length > 100) errors.title = 'Title must be at most 100 characters';

  const description = values.description.trim();
  if (!description) errors.description = 'Description is required';
  else if (description.length > 500) errors.description = 'Description must be at most 500 characters';

  if (values.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(values.dueDate)) {
    errors.dueDate = 'Due date is not valid';
  }

  return errors;
}
