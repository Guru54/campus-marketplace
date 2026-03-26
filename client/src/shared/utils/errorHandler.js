/**
 * Error Handler Utility
 * Centralized error message extraction and handling
 */

/**
 * Extract error message from API response or error object
 * @param {Error | AxiosError} error - Error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, fallback = "Something went wrong") => {
  // Axios error with response
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Axios error with custom message
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  // Generic error message
  if (error?.message) {
    return error.message;
  }

  return fallback;
};

/**
 * Get HTTP status code from error
 * @param {AxiosError} error - Error object
 * @returns {number | null} Status code or null
 */
export const getErrorStatus = (error) => {
  return error?.response?.status ?? null;
};

/**
 * Check if error is a specific type
 * @param {AxiosError} error - Error object
 * @param {number} status - HTTP status code to check
 * @returns {boolean}
 */
export const isErrorStatus = (error, status) => {
  return getErrorStatus(error) === status;
};

/**
 * Check if error is unauthorized (401)
 */
export const isUnauthorized = (error) => isErrorStatus(error, 401);

/**
 * Check if error is not found (404)
 */
export const isNotFound = (error) => isErrorStatus(error, 404);

/**
 * Check if error is validation error (422)
 */
export const isValidationError = (error) => isErrorStatus(error, 422);
