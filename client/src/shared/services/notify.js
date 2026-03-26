/**
 * Toast Notification Service
 * Wrapper around react-hot-toast for consistent notifications
 */

import toast from "react-hot-toast";

const DEFAULT_DURATION = 3000;
const ERROR_DURATION = 4000;

/**
 * Show success notification
 */
export const notify = {
  success: (message, duration = DEFAULT_DURATION) => {
    toast.success(message, { duration });
  },

  error: (message, duration = ERROR_DURATION) => {
    toast.error(message, { duration });
  },

  loading: (message) => {
    return toast.loading(message);
  },

  dismiss: (toastId) => {
    if (toastId) toast.dismiss(toastId);
  },

  promise: (promise, messages) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || "Loading...",
        success: messages.success || "Success!",
        error: messages.error || "Error!",
      }
    );
  },

  // Helper: success then redirect
  successThen: (message, callback, delay = 500) => {
    toast.success(message);
    setTimeout(callback, delay);
  },

  // Helper: error with custom duration
  errorLong: (message) => {
    toast.error(message, { duration: 5000 });
  },
};

export default notify;
