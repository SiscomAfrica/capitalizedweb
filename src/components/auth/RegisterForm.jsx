import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import PhoneInput from '../common/PhoneInput';
import authClient from '../../api/authClient';
import { validateEmail, validatePhoneNumber, validatePassword, validateName } from '../../utils/validators';
import { formatPhoneNumber } from '../../utils/formatters';

const RegisterForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message;
    }

    // Phone validation
    const phoneValidation = validatePhoneNumber(formData.phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.message;
    }

    // Password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // First name validation
    const firstNameValidation = validateName(formData.firstName, 'First name');
    if (!firstNameValidation.isValid) {
      newErrors.firstName = firstNameValidation.message;
    }

    // Last name validation
    const lastNameValidation = validateName(formData.lastName, 'Last name');
    if (!lastNameValidation.isValid) {
      newErrors.lastName = lastNameValidation.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
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

    // Clear confirm password error if password changes
    if (field === 'password' && errors.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: ''
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
      const userData = {
        email: formData.email,
        phone: formatPhoneNumber(formData.phone, 'api'), // Format phone for API
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      };

      const response = await authClient.register(userData);
      
      // Call success callback with response data
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle different error types
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        // Handle field-specific errors
        if (errorData.detail && Array.isArray(errorData.detail)) {
          // Handle Pydantic validation errors format
          const fieldErrors = {};
          errorData.detail.forEach(error => {
            if (error.loc && error.loc.length > 1) {
              const field = error.loc[error.loc.length - 1]; // Get the field name
              const fieldMap = {
                'email': 'email',
                'phone': 'phone',
                'password': 'password',
                'full_name': 'firstName', // Map full_name errors to firstName field
              };
              const frontendField = fieldMap[field] || field;
              fieldErrors[frontendField] = error.msg || 'Invalid value';
            }
          });
          setErrors(fieldErrors);
        } else if (errorData.detail && typeof errorData.detail === 'object') {
          const fieldErrors = {};
          Object.keys(errorData.detail).forEach(field => {
            // Map backend field names to frontend field names
            const fieldMap = {
              'email': 'email',
              'phone': 'phone',
              'password': 'password',
              'full_name': 'firstName', // Map full_name errors to firstName field
            };
            const frontendField = fieldMap[field] || field;
            fieldErrors[frontendField] = Array.isArray(errorData.detail[field]) 
              ? errorData.detail[field][0] 
              : errorData.detail[field];
          });
          setErrors(fieldErrors);
        } else if (errorData.detail) {
          setErrors({ general: errorData.detail });
        } else {
          setErrors({ general: 'Please check your information and try again.' });
        }
      } else if (error.response?.status === 409) {
        setErrors({ 
          general: 'An account with this email or phone number already exists.' 
        });
      } else if (error.response?.data?.detail) {
        // API returned specific error message (sanitize technical details)
        const message = error.response.data.detail;
        const sanitizedMessage = message.includes('database') || message.includes('server') 
          ? 'Registration failed. Please try again later.'
          : message;
        setErrors({ general: sanitizedMessage });
      } else if (error.message === 'Network Error') {
        setErrors({ 
          general: 'Connection error. Please check your internet connection and try again.' 
        });
      } else {
        setErrors({ 
          general: 'Registration failed. Please try again later.' 
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
            Create Account
          </h2>
          <p className="text-secondary-600">
            Join us to start your investment journey
          </p>
        </div>

        {errors.general && (
          <div className="bg-error-50 border border-error-200 rounded-lg p-4 text-error-700 text-sm">
            {errors.general}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="text"
              label="First Name"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              error={errors.firstName}
              required
              disabled={loading}
              autoComplete="given-name"
            />

            <Input
              type="text"
              label="Last Name"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              error={errors.lastName}
              required
              disabled={loading}
              autoComplete="family-name"
            />
          </div>

          <Input
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange('email')}
            error={errors.email}
            required
            disabled={loading}
            autoComplete="email"
          />

          <PhoneInput
            label="Phone Number"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleInputChange('phone')}
            error={errors.phone}
            required
            disabled={loading}
            showCountrySelector={false}
            defaultCountry="KENYA"
          />

          <Input
            type="password"
            label="Password"
            placeholder="Create a password (min. 8 characters)"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={errors.password}
            required
            disabled={loading}
            autoComplete="new-password"
          />

          <Input
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            error={errors.confirmPassword}
            required
            disabled={loading}
            autoComplete="new-password"
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
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <div className="text-center">
          <p className="text-sm text-secondary-600">
            Already have an account?{' '}
            <button
              type="button"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              onClick={() => {
                // This will be handled by the parent component for navigation
                console.log('Navigate to login');
              }}
            >
              Sign in here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;