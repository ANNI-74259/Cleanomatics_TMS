// ONE form used for both Create and Edit.
// Props: initialValues, onSubmit(payload), submitLabel, onCancel
import { useState } from 'react';
import { validateTask } from '../../utils/validators';
import { STATUSES, PRIORITIES } from '../../utils/constants';
import Button from '../ui/Button';

// Today's date as YYYY-MM-DD in the user's local time (used as the earliest allowed due date)
function getTodayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function TaskForm({ initialValues = {}, onSubmit, submitLabel = 'Save', onCancel }) {
  const today = getTodayString();
  const [values, setValues] = useState({
    title: initialValues.title ?? '',
    description: initialValues.description ?? '',
    status: initialValues.status ?? 'pending',
    priority: initialValues.priority ?? 'medium',
    dueDate: initialValues.dueDate ?? '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' })); // clear the error of this field
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    // 1. check in the browser first
    const foundErrors = validateTask(values);

    // a past date is not allowed. (An old task may keep its original date if it is unchanged.)
    if (values.dueDate && values.dueDate < today && values.dueDate !== initialValues.dueDate) {
      foundErrors.dueDate = 'Due date cannot be in the past';
    }

    if (Object.keys(foundErrors).length > 0) {
      setErrors(foundErrors);
      return;
    }

    // 2. send to the API. If the backend rejects it, show its messages too
    setSubmitting(true);
    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim(),
        status: values.status,
        priority: values.priority,
        dueDate: values.dueDate || null,
      });
    } catch (err) {
      const fromServer = {};
      (err.fieldErrors || []).forEach((item) => {
        fromServer[item.field] = item.message;
      });
      setErrors(fromServer);
      setFormError(err.message || 'Could not save the task.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (name) => `input${errors[name] ? ' input--error' : ''}`;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {formError && (
        <div className="form-error" role="alert">
          {formError}
        </div>
      )}

      <div className="field">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          name="title"
          className={inputClass('title')}
          value={values.title}
          onChange={handleChange}
          maxLength={100}
          placeholder="e.g. Prepare presentation"
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title && <span className="field__error">{errors.title}</span>}
      </div>

      <div className="field">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          className={inputClass('description')}
          rows={4}
          value={values.description}
          onChange={handleChange}
          maxLength={500}
          placeholder="What needs to be done?"
          aria-invalid={Boolean(errors.description)}
        />
        <span className="field__hint">{values.description.length}/500</span>
        {errors.description && <span className="field__error">{errors.description}</span>}
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" className="input" value={values.status} onChange={handleChange}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" className="input" value={values.priority} onChange={handleChange}>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="dueDate">Due date</label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            min={today}
            className={inputClass('dueDate')}
            value={values.dueDate}
            onChange={handleChange}
          />
          {errors.dueDate && <span className="field__error">{errors.dueDate}</span>}
        </div>
      </div>

      <div className="form-actions">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
