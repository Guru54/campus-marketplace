/**
 * useForm Hook
 * Abstraction for form state management, validation, and submission
 */

import { useState, useCallback } from "react";

/**
 * Custom hook for form management
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Callback function when form is submitted
 * @param {Object} validate - Validation function (optional)
 * @returns {Object} Form state and handlers
 */
export const useForm = (initialValues, onSubmit, validate = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  // Handle blur event for field marking
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    // Validate field if validation function provided
    if (validate) {
      const fieldError = validate(name, values[name]);
      if (fieldError) {
        setErrors((prev) => ({ ...prev, [name]: fieldError }));
      }
    }
  }, [values, validate]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();
      setIsSubmitting(true);

      // Run validation if provided
      let newErrors = {};
      if (validate) {
        for (const key in values) {
          const error = validate(key, values[key]);
          if (error) newErrors[key] = error;
        }
        setErrors(newErrors);
      }

      // If no errors, submit
      if (Object.keys(newErrors).length === 0) {
        try {
          await onSubmit(values);
        } catch (error) {
          console.error("Form submission error:", error);
        }
      }

      setIsSubmitting(false);
    },
    [values, validate, onSubmit]
  );

  // Set field value programmatically
  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Set field error programmatically
  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  // Get field props for easy spread
  const getFieldProps = useCallback(
    (name) => ({
      name,
      value: values[name] ?? "",
      onChange: handleChange,
      onBlur: handleBlur,
    }),
    [values, handleChange, handleBlur]
  );

  // Get field error and touched state
  const getFieldMeta = useCallback(
    (name) => ({
      value: values[name] ?? "",
      error: errors[name],
      isTouched: touched[name],
      isError: !!errors[name] && touched[name],
    }),
    [values, errors, touched]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    setValues,
    setTouched,
    setErrors,
    getFieldProps,
    getFieldMeta,
  };
};

/**
 * Common validation rules
 */
export const validators = {
  required: (value, fieldName = "This field") =>
    !value ? `${fieldName} is required` : null,

  email: (value) => {
    if (!value) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) ? "Invalid email address" : null;
  },

  password: (value, minLength = 6) => {
    if (!value) return "Password is required";
    if (value.length < minLength) return `Password must be at least ${minLength} characters`;
    return null;
  },

  passwordMatch: (password, confirmPassword) => {
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  },

  minLength: (value, minLength = 3, fieldName = "This field") => {
    if (!value) return null;
    return value.length < minLength ? `${fieldName} must be at least ${minLength} characters` : null;
  },

  maxLength: (value, maxLength = 100, fieldName = "This field") => {
    if (!value) return null;
    return value.length > maxLength ? `${fieldName} cannot exceed ${maxLength} characters` : null;
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return "Invalid URL";
    }
  },

  number: (value) => {
    if (!value) return null;
    return isNaN(value) ? "Must be a number" : null;
  },

  positive: (value) => {
    if (!value) return null;
    return Number(value) > 0 ? null : "Must be a positive number";
  },
};

/**
 * Composite validator
 * Combine multiple validators for a single field
 */
export const composeValidators = (...validatorFns) => {
  return (value) => {
    for (let validator of validatorFns) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };
};
