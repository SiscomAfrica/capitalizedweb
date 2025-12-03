import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import PhoneInput from '../common/PhoneInput';
import { useAuthContext } from '../../contexts/AuthContext';
import { validateEmail, validatePhoneNumber } from '../../utils/validators';
import { formatPhoneNumber } from '../../utils/formatters';

const LoginForm = ({ onSuccess }) => {
  const { login } = useAuthContext();
  const [formData, setFormData] = useState({
    identifier: '', // Can be email or phone
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('email'); // 'email' or 'phone'

  // Auto-detect login type based on input
  const detectLoginType = (value) => {
    if (!value) return 'email';
    
    // If it contains @ symbol, it's likely an email
    if (value.includes('@')) {
      return 'email';
    }
    
    // If it starts with + or contains only digits (with possible spaces/dashes), it's likely a phone
    const phonePattern = /^[+\d\s\-()]+$/;
    if (phonePattern.test(value)) {
      return 'phone';
    }
    
    // Default to email for other cases
    return 'email';
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.identifier) {
      newErrors.identifier = loginType === 'email' ? 'Email is required' : 'Phone number is required';
    } else {
      if (loginType === 'email') {
        const emailValidation = validateEmail(formData.identifier);
        if (!emailValidation.isValid) {
          newErrors.identifier = emailValidation.message;
        }
      } else {
        const phoneValidation = validatePhoneNumber(formData.identifier);
        if (!phoneValidation.isValid) {
          newErrors.identifier = phoneValidation.message;
        }
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    
    // Auto-detect login type for identifier field
    if (field === 'identifier') {
      const detectedType = detectLoginType(value);
      setLoginType(detectedType);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Format phone number for API if it's a phone login
      let loginIdentifier = formData.identifier;
      if (loginType === 'phone') {
        loginIdentifier = formatPhoneNumber(formData.identifier, 'api');
      }
      
      const response = await login(loginIdentifier, formData.password);
      
      // Call success callback with response data
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error types
      if (error.response?.status === 401) {
        setErrors({ 
          general: 'Invalid email or password. Please check your credentials and try again.' 
        });
      } else if (error.response?.status === 403) {
        setErrors({ 
          general: 'Your account is not verified. Please check your email for verification instructions.' 
        });
      } else if (error.response?.status === 422) {
        // Handle validation errors (similar to registration)
        const errorData = error.response.data;
        if (errorData.detail && Array.isArray(errorData.detail)) {
          // Handle Pydantic validation errors format
          const fieldErrors = {};
          errorData.detail.forEach(error => {
            if (error.loc && error.loc.length > 1) {
              const field = error.loc[error.loc.length - 1]; // Get the field name
              const fieldMap = {
                'identifier': 'identifier',
                'password': 'password',
              };
              const frontendField = fieldMap[field] || field;
              fieldErrors[frontendField] = error.msg || 'Invalid value';
            }
          });
          setErrors(fieldErrors);
        } else if (errorData.detail) {
          setErrors({ general: errorData.detail });
        } else {
          setErrors({ general: 'Please check your information and try again.' });
        }
      } else if (error.response?.data?.detail) {
        // API returned specific error message
        setErrors({ 
          general: error.response.data.detail 
        });
      } else if (error.message === 'Network Error') {
        setErrors({ 
          general: 'Connection error. Please check your internet connection and try again.' 
        });
      } else {
        setErrors({ 
          general: 'An unexpected error occurred. Please try again later.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-secondary-600">
            Sign in with your email or phone number
          </p>
        </div>

        {errors.general && (
          <div className="bg-error-50 border border-error-200 rounded-lg p-4 text-error-700 text-sm">
            {errors.general}
          </div>
        )}

        <div className="space-y-4">
          {/* Login Type Toggle */}
          <div className="flex items-center justify-center mb-4">
            <div className="flex bg-secondary-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => {
                  setLoginType('email');
                  setFormData(prev => ({ ...prev, identifier: '' }));
                  setErrors({});
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  loginType === 'email'
                    ? 'bg-white text-secondary-900 shadow-sm'
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginType('phone');
                  setFormData(prev => ({ ...prev, identifier: '' }));
                  setErrors({});
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  loginType === 'phone'
                    ? 'bg-white text-secondary-900 shadow-sm'
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                Phone
              </button>
            </div>
          </div>

          {/* Dynamic Input Field */}
          {loginType === 'email' ? (
            <Input
              type="email"
              label="Email Address"
              placeholder="Enter your email address"
              value={formData.identifier}
              onChange={handleInputChange('identifier')}
              error={errors.identifier}
              required
              disabled={loading}
              autoComplete="email"
            />
          ) : (
            <PhoneInput
              label="Phone Number"
              placeholder="Enter your phone number"
              value={formData.identifier}
              onChange={handleInputChange('identifier')}
              error={errors.identifier}
              required
              disabled={loading}
              showCountrySelector={false}
              defaultCountry="KENYA"
            />
          )}

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={errors.password}
            required
            disabled={loading}
            autoComplete="current-password"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>

        <div className="text-center">
          <p className="text-sm text-secondary-600">
            Don't have an account?{' '}
            <button
              type="button"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              onClick={() => {
                // This will be handled by the parent component for navigation
                console.log('Navigate to register');
              }}
            >
              Sign up here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;