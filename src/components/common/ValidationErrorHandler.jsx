import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

// Field-specific validation error component
export const FieldError = ({
  error,
  className = '',
  showIcon = true,
  ...props
}) => {
  if (!error) return null;

  return (
    <motion.div
      className={`flex items-start mt-1 text-sm text-error-600 ${className}`}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {showIcon && (
        <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" />
      )}
      <span className="leading-tight">{error}</span>
    </motion.div>
  );
};

// Form validation summary component
export const ValidationSummary = ({
  errors,
  title = 'Please fix the following errors:',
  className = '',
  onDismiss,
  dismissible = false,
}) => {
  if (!errors || Object.keys(errors).length === 0) return null;

  const errorList = Object.entries(errors).filter(([_, error]) => error);

  if (errorList.length === 0) return null;

  return (
    <motion.div
      className={`
        bg-error-50 border border-error-200 rounded-lg p-4 mb-6
        ${className}
      `.trim()}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-error-800 mb-2">
            {title}
          </h3>
          
          <ul className="text-sm text-error-700 space-y-1">
            {errorList.map(([field, error]) => (
              <li key={field} className="flex items-start">
                <span className="w-1 h-1 bg-error-600 rounded-full flex-shrink-0 mt-2 mr-2" />
                <span>
                  <span className="font-medium capitalize">
                    {field.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                  </span>{' '}
                  {error}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {dismissible && onDismiss && (
          <button
            type="button"
            className="ml-2 text-error-400 hover:text-error-600 transition-colors duration-200"
            onClick={onDismiss}
            aria-label="Dismiss validation errors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Server validation error parser
export const parseServerValidationErrors = (error) => {
  const errors = {};

  if (!error || !error.data) {
    return errors;
  }

  // Handle different server error response formats
  const { data } = error;

  // Format 1: { field: "error message" }
  if (typeof data === 'object' && !Array.isArray(data)) {
    Object.entries(data).forEach(([field, message]) => {
      if (typeof message === 'string') {
        errors[field] = message;
      } else if (Array.isArray(message) && message.length > 0) {
        errors[field] = message[0];
      }
    });
  }

  // Format 2: { errors: { field: ["error1", "error2"] } }
  if (data.errors && typeof data.errors === 'object') {
    Object.entries(data.errors).forEach(([field, messages]) => {
      if (Array.isArray(messages) && messages.length > 0) {
        errors[field] = messages[0];
      } else if (typeof messages === 'string') {
        errors[field] = messages;
      }
    });
  }

  // Format 3: { detail: [{ field: "field_name", message: "error message" }] }
  if (Array.isArray(data.detail)) {
    data.detail.forEach((item) => {
      if (item.field && item.message) {
        errors[item.field] = item.message;
      }
    });
  }

  // Format 4: FastAPI validation errors
  if (Array.isArray(data) && data.length > 0) {
    data.forEach((item) => {
      if (item.loc && item.msg) {
        const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : item.loc;
        errors[field] = item.msg;
      }
    });
  }

  return errors;
};

// Hook for managing validation errors
export const useValidationErrors = (initialErrors = {}) => {
  const [errors, setErrors] = React.useState(initialErrors);

  const setFieldError = (field, error) => {
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  };

  const clearFieldError = (field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const setServerErrors = (serverError) => {
    const parsedErrors = parseServerValidationErrors(serverError);
    setErrors(parsedErrors);
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  const hasErrors = Object.keys(errors).some(key => errors[key]);

  return {
    errors,
    setFieldError,
    clearFieldError,
    setServerErrors,
    clearAllErrors,
    hasErrors,
  };
};

// Enhanced Input component with validation error display
export const ValidatedInput = React.forwardRef(({
  error,
  label,
  required = false,
  className = '',
  ...props
}, ref) => {
  const hasError = !!error;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-offset-2
          transition-colors duration-200
          ${hasError
            ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }
        `.trim()}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${props.id || props.name}-error` : undefined}
        {...props}
      />
      
      <AnimatePresence>
        {hasError && (
          <FieldError
            error={error}
            id={`${props.id || props.name}-error`}
          />
        )}
      </AnimatePresence>
    </div>
  );
});

ValidatedInput.displayName = 'ValidatedInput';

// Form wrapper with validation error handling
export const ValidatedForm = ({
  children,
  errors,
  onSubmit,
  showSummary = true,
  className = '',
  ...props
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={className}
      noValidate
      {...props}
    >
      <AnimatePresence>
        {showSummary && (
          <ValidationSummary errors={errors} />
        )}
      </AnimatePresence>
      
      {children}
    </form>
  );
};

export default {
  FieldError,
  ValidationSummary,
  ValidatedInput,
  ValidatedForm,
  parseServerValidationErrors,
  useValidationErrors,
};