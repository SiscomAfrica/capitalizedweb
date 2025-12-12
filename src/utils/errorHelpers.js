/**
 * Error handling utilities
 */

/**
 * Check if an error indicates that a user/account was not found
 * @param {Object} error - The error object from API response
 * @returns {boolean} - True if error indicates user not found
 */
export const isUserNotFoundError = (error) => {
  if (!error) return false;
  
  // Check status codes that typically indicate user not found
  const notFoundStatuses = [401, 404];
  if (error.response?.status && notFoundStatuses.includes(error.response.status)) {
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        error.message || '';
    
    // Common patterns that indicate user not found
    const userNotFoundPatterns = [
      'user not found',
      'account not found',
      'no account',
      'does not exist',
      'user does not exist',
      'account does not exist',
      'invalid credentials', // Sometimes APIs return this for non-existent users
      'authentication failed', // Generic auth failure that could mean user not found
    ];
    
    const lowerMessage = errorMessage.toLowerCase();
    return userNotFoundPatterns.some(pattern => lowerMessage.includes(pattern));
  }
  
  return false;
};

/**
 * Get user-friendly error message for authentication errors
 * @param {Object} error - The error object from API response
 * @param {string} loginType - 'email' or 'phone'
 * @returns {Object} - Object with message, showRegisterLink flag, and field errors
 */
export const getAuthErrorMessage = (error, loginType = 'email') => {
  if (isUserNotFoundError(error)) {
    return {
      message: `No account found with this ${loginType === 'email' ? 'email' : 'phone number'}. Would you like to create an account instead?`,
      showRegisterLink: true,
      fieldErrors: {
        identifier: `No account found with this ${loginType === 'email' ? 'email' : 'phone number'}`
      }
    };
  }
  
  // Handle other common auth errors
  if (error.response?.status === 401) {
    // Use the actual API error message if available, otherwise use a generic message
    const apiMessage = error.response?.data?.detail || 
                      error.response?.data?.message || 
                      error.message;
    
    // Check if it's specifically about invalid credentials
    const lowerMessage = apiMessage.toLowerCase();
    if (lowerMessage.includes('invalid') && (lowerMessage.includes('password') || lowerMessage.includes('credentials'))) {
      return {
        message: 'Please check your credentials and try again.',
        showRegisterLink: false,
        fieldErrors: {
          identifier: 'Please check this information',
          password: 'Please check this information'
        }
      };
    }
    
    return {
      message: apiMessage || 'Invalid credentials. Please check your email/phone and password and try again.',
      showRegisterLink: false,
      fieldErrors: {
        identifier: 'Please verify this information',
        password: 'Please verify this information'
      }
    };
  }
  
  if (error.response?.status === 403) {
    return {
      message: 'Your account is not verified. Please check your email for verification instructions.',
      showRegisterLink: false
    };
  }
  
  if (error.response?.status === 422) {
    return {
      message: 'Please check your information and try again.',
      showRegisterLink: false
    };
  }
  
  if (error.message === 'Network Error') {
    return {
      message: 'Connection error. Please check your internet connection and try again.',
      showRegisterLink: false
    };
  }
  
  // Default error message
  return {
    message: error.response?.data?.detail || 
             error.response?.data?.message || 
             'An unexpected error occurred. Please try again later.',
    showRegisterLink: false
  };
};

/**
 * Extract field-specific validation errors from API response
 * @param {Object} errorData - The error data from API response
 * @returns {Object} - Object with field names as keys and error messages as values
 */
export const extractValidationErrors = (errorData) => {
  const fieldErrors = {};
  
  if (errorData.detail && Array.isArray(errorData.detail)) {
    // Handle Pydantic validation errors format
    errorData.detail.forEach(error => {
      if (error.loc && error.loc.length > 1) {
        const field = error.loc[error.loc.length - 1]; // Get the field name
        const fieldMap = {
          'identifier': 'identifier',
          'password': 'password',
          'email': 'email',
          'phone': 'phone',
          'full_name': 'firstName',
        };
        const frontendField = fieldMap[field] || field;
        fieldErrors[frontendField] = error.msg || 'Invalid value';
      }
    });
  } else if (errorData.detail && typeof errorData.detail === 'object') {
    // Handle object-based validation errors
    Object.keys(errorData.detail).forEach(field => {
      const fieldMap = {
        'identifier': 'identifier',
        'password': 'password',
        'email': 'email',
        'phone': 'phone',
        'full_name': 'firstName',
      };
      const frontendField = fieldMap[field] || field;
      fieldErrors[frontendField] = Array.isArray(errorData.detail[field]) 
        ? errorData.detail[field][0] 
        : errorData.detail[field];
    });
  }
  
  return fieldErrors;
};