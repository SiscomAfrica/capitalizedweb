import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for managing loading states
 * @param {boolean} initialState - Initial loading state
 * @returns {Object} Loading state management object
 */
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState(null);
  const loadingRef = useRef(false);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
    loadingRef.current = true;
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    loadingRef.current = false;
  }, []);

  const setLoadingError = useCallback((error) => {
    setError(error);
    setIsLoading(false);
    loadingRef.current = false;
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    loadingRef.current = false;
  }, []);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    reset,
    isCurrentlyLoading: () => loadingRef.current,
  };
};

/**
 * Custom hook for managing multiple loading states
 * @param {Array<string>} keys - Array of loading state keys
 * @returns {Object} Multiple loading states management object
 */
export const useMultipleLoadingStates = (keys = []) => {
  const [loadingStates, setLoadingStates] = useState(
    keys.reduce((acc, key) => ({ ...acc, [key]: false }), {})
  );
  const [errors, setErrors] = useState(
    keys.reduce((acc, key) => ({ ...acc, [key]: null }), {})
  );

  const setLoading = useCallback((key, loading) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
    if (loading) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  }, []);

  const setError = useCallback((key, error) => {
    setErrors(prev => ({ ...prev, [key]: error }));
    setLoadingStates(prev => ({ ...prev, [key]: false }));
  }, []);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  const reset = useCallback((key) => {
    if (key) {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
      setErrors(prev => ({ ...prev, [key]: null }));
    } else {
      setLoadingStates(keys.reduce((acc, k) => ({ ...acc, [k]: false }), {}));
      setErrors(keys.reduce((acc, k) => ({ ...acc, [k]: null }), {}));
    }
  }, [keys]);

  return {
    loadingStates,
    errors,
    setLoading,
    setError,
    isAnyLoading,
    reset,
  };
};

/**
 * Custom hook for async operations with loading state
 * @param {Function} asyncFunction - The async function to execute
 * @param {Object} options - Configuration options
 * @returns {Object} Async operation management object
 */
export const useAsyncOperation = (asyncFunction, options = {}) => {
  const {
    onSuccess,
    onError,
    immediate = false,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await asyncFunction(...args);
      
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      setError(err);
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [asyncFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setData(null);
    setError(null);
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    execute,
    isLoading,
    data,
    error,
    reset,
  };
};

/**
 * Custom hook for managing form submission loading state
 * @param {Function} submitFunction - The form submission function
 * @param {Object} options - Configuration options
 * @returns {Object} Form submission management object
 */
export const useFormSubmission = (submitFunction, options = {}) => {
  const {
    onSuccess,
    onError,
    resetOnSuccess = true,
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = useCallback(async (formData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);
      
      const result = await submitFunction(formData);
      
      setSubmitSuccess(true);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      setSubmitError(error);
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [submitFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setSubmitError(null);
    setSubmitSuccess(false);
  }, []);

  // Reset success state after a delay
  useEffect(() => {
    if (submitSuccess && resetOnSuccess) {
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [submitSuccess, resetOnSuccess]);

  return {
    handleSubmit,
    isSubmitting,
    submitError,
    submitSuccess,
    reset,
  };
};

export default useLoadingState;