import { useState, useCallback } from 'react';
import { useNetworkErrorHandler } from '../components/common/NetworkErrorHandler';
import { useAuthErrorHandler } from '../components/common/AuthErrorHandler';
import { useServerErrorHandler } from '../components/common/ServerErrorHandler';
import { useValidationErrors } from '../components/common/ValidationErrorHandler';

/**
 * Comprehensive error handler hook that manages all types of errors
 * @param {Object} options - Configuration options
 * @returns {Object} Error handling utilities
 */
export const useErrorHandler = (options = {}) => {
  const {
    onNetworkError,
    onAuthError,
    onServerError,
    onValidationError,
    onGenericError,
  } = options;

  // Individual error handlers
  const networkHandler = useNetworkErrorHandler();
  const authHandler = useAuthErrorHandler();
  const serverHandler = useServerErrorHandler();
  const validationHandler = useValidationErrors();

  // Generic error state
  const [genericError, setGenericError] = useState(null);

  /**
   * Main error handler that routes errors to appropriate handlers
   * @param {Object} error - The error object
   * @returns {boolean} Whether the error was handled
   */
  const handleError = useCallback((error) => {
    // Clear previous generic error
    setGenericError(null);

    // Try network error handler first
    if (networkHandler.handleError(error)) {
      if (onNetworkError) onNetworkError(error);
      return true;
    }

    // Try authentication error handler
    if (authHandler.handleAuthError(error)) {
      if (onAuthError) onAuthError(error);
      return true;
    }

    // Try server error handler
    if (serverHandler.handleServerError(error)) {
      if (onServerError) onServerError(error);
      return true;
    }

    // Try validation error handler
    if (error.type === 'validation' || error.status === 400 || error.status === 422) {
      validationHandler.setServerErrors(error);
      if (onValidationError) onValidationError(error);
      return true;
    }

    // Handle generic errors
    setGenericError({
      message: error.message || 'An unexpected error occurred',
      type: 'generic',
      originalError: error,
    });

    if (onGenericError) onGenericError(error);
    return true;
  }, [
    networkHandler,
    authHandler,
    serverHandler,
    validationHandler,
    onNetworkError,
    onAuthError,
    onServerError,
    onValidationError,
    onGenericError,
  ]);

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    networkHandler.clearError();
    authHandler.clearError();
    serverHandler.clearError();
    validationHandler.clearAllErrors();
    setGenericError(null);
  }, [networkHandler, authHandler, serverHandler, validationHandler]);

  /**
   * Get the current active error (prioritized)
   */
  const getCurrentError = useCallback(() => {
    if (networkHandler.networkError) return { type: 'network', error: networkHandler.networkError };
    if (authHandler.authError) return { type: 'auth', error: authHandler.authError };
    if (serverHandler.serverError) return { type: 'server', error: serverHandler.serverError };
    if (validationHandler.hasErrors) return { type: 'validation', errors: validationHandler.errors };
    if (genericError) return { type: 'generic', error: genericError };
    return null;
  }, [
    networkHandler.networkError,
    authHandler.authError,
    serverHandler.serverError,
    validationHandler.hasErrors,
    validationHandler.errors,
    genericError,
  ]);

  /**
   * Check if any error is currently active
   */
  const hasError = useCallback(() => {
    return !!(
      networkHandler.networkError ||
      authHandler.authError ||
      serverHandler.serverError ||
      validationHandler.hasErrors ||
      genericError
    );
  }, [
    networkHandler.networkError,
    authHandler.authError,
    serverHandler.serverError,
    validationHandler.hasErrors,
    genericError,
  ]);

  /**
   * Retry function that clears errors and executes retry callback
   */
  const retry = useCallback((retryFunction) => {
    clearAllErrors();
    if (retryFunction) {
      return retryFunction();
    }
  }, [clearAllErrors]);

  return {
    // Main error handler
    handleError,
    
    // Error states
    networkError: networkHandler.networkError,
    authError: authHandler.authError,
    serverError: serverHandler.serverError,
    validationErrors: validationHandler.errors,
    genericError,
    
    // Auth-specific states
    showSessionModal: authHandler.showSessionModal,
    
    // Network-specific states
    isOnline: networkHandler.isOnline,
    
    // Utility functions
    clearAllErrors,
    getCurrentError,
    hasError,
    retry,
    
    // Individual handlers (for advanced use)
    networkHandler,
    authHandler,
    serverHandler,
    validationHandler,
  };
};

/**
 * Hook for async operations with comprehensive error handling
 * @param {Function} asyncFunction - The async function to execute
 * @param {Object} options - Configuration options
 * @returns {Object} Async operation with error handling
 */
export const useAsyncWithErrorHandling = (asyncFunction, options = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const errorHandler = useErrorHandler(options);

  const execute = useCallback(async (...args) => {
    try {
      setIsLoading(true);
      errorHandler.clearAllErrors();
      
      const result = await asyncFunction(...args);
      setData(result);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (error) {
      errorHandler.handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [asyncFunction, errorHandler, options]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setData(null);
    errorHandler.clearAllErrors();
  }, [errorHandler]);

  return {
    execute,
    isLoading,
    data,
    reset,
    ...errorHandler,
  };
};

export default useErrorHandler;