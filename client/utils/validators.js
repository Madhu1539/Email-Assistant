/**
 * Client-side validation helpers.
 * These mirror server-side rules for immediate user feedback.
 * Server-side validation is always the authoritative source.
 */

export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function validateRegistration({ name, email, password, passwordConfirmation }) {
  const errors = {};

  if (!name || name.trim().length === 0) errors.name = 'Name is required.';
  else if (name.trim().length > 100) errors.name = 'Name must not exceed 100 characters.';

  if (!email || email.trim().length === 0) errors.email = 'Email is required.';
  else if (!isValidEmail(email)) errors.email = 'Must be a valid email address.';

  if (!password) errors.password = 'Password is required.';
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters.';

  if (!passwordConfirmation) errors.passwordConfirmation = 'Please confirm your password.';
  else if (password !== passwordConfirmation) errors.passwordConfirmation = 'Passwords do not match.';

  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};

  if (!email || email.trim().length === 0) errors.email = 'Email is required.';
  else if (!isValidEmail(email)) errors.email = 'Must be a valid email address.';

  if (!password) errors.password = 'Password is required.';

  return errors;
}

export function validateCompose({ to, subject, body }) {
  const errors = {};

  if (!to || to.length === 0) errors.to = 'At least one recipient is required.';
  else {
    const invalidAddresses = to.filter((addr) => !isValidEmail(addr.trim()));
    if (invalidAddresses.length > 0)
      errors.to = `Invalid email address(es): ${invalidAddresses.join(', ')}`;
  }

  if (subject && subject.length > 998) errors.subject = 'Subject must not exceed 998 characters.';

  return errors;
}

/**
 * Returns true if the errors object has no entries.
 */
export function isValid(errors) {
  return Object.keys(errors).length === 0;
}

/**
 * Extracts error message from Axios error response.
 */
export function getApiError(error) {
  return (
    error?.response?.data?.error?.message ||
    error?.message ||
    'An unexpected error occurred.'
  );
}

/**
 * Extracts field-level error details from Axios error response.
 */
export function getApiFieldErrors(error) {
  return error?.response?.data?.error?.details || {};
}
