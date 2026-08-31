/**
 * errorUtils.js — Translates backend error codes into user-friendly messages
 */

export function getFriendlyErrorMessage(error) {
  if (!error) return 'An unexpected error occurred. Please try again.';

  if (typeof error === 'string') return error;

  const code = error.code || error.data?.error?.code;
  const rawMsg = error.message || error.data?.error?.message;

  switch (code) {
    case 'UNAUTHORIZED':
    case 'SESSION_EXPIRED':
      return 'Your session has expired. Please sign in again.';
    case 'FORBIDDEN':
      return 'You do not have permission to access this resource.';
    case 'RESOURCE_NOT_FOUND':
    case 'NOT_FOUND':
      return "We couldn't find the requested information.";
    case 'DUPLICATE_RESOURCE':
    case 'RESOURCE_CONFLICT':
      return 'This item or account already exists.';
    case 'RATE_LIMIT_EXCEEDED':
      return 'Too many requests. Please wait a moment and try again.';
    case 'VALIDATION_ERROR':
    case 'INVALID_INPUT':
      return rawMsg || 'Please check your information and try again.';
    default:
      if (error.isNetworkError) {
        return 'Network connection issue. Please check your internet connection.';
      }
      return rawMsg || 'Something went wrong. Please try again.';
  }
}
