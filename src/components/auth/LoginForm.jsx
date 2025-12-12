import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validateEmail, validatePhoneNumber } from '../../utils/validators';
import { PhoneInputWithCountry } from '../common';
import useAuth from '../../hooks/useAuth';

const LoginForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  
  // UI state
  const [loginType, setLoginType] = useState('email');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // No modal or toast state needed



  // Form validation
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
        // For phone numbers, validate the full international format
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

    return newErrors;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    // Auto-detect login type for email input
    if (field === 'identifier' && loginType === 'email') {
      if (value.includes('@')) {
        setLoginType('email');
      } else if (value.startsWith('+') || /^\d+$/.test(value)) {
        setLoginType('phone');
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Clear any existing errors and start loading
    setErrors({});
    setLoading(true);

    try {
      // Use AuthContext login method instead of direct API call
      const response = await login(formData.identifier, formData.password);
      
      console.log('Login success via AuthContext:', response);
      
      // Call success callback
      if (onSuccess) {
        onSuccess({
          success: true,
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
        });
      } else {
        // Check if phone is verified (prioritize phone_verified field)
        const isPhoneVerified = response.user?.phone_verified === true || 
                               response.user?.phoneVerified === true || 
                               response.user?.is_phone_verified === true;
        
        console.log('Login success - User verification status:', {
          phone_verified: response.user?.phone_verified,
          phoneVerified: response.user?.phoneVerified,
          is_phone_verified: response.user?.is_phone_verified,
          profile_completed: response.user?.profile_completed,
          isPhoneVerified,
          willRedirectTo: isPhoneVerified ? 'dashboard' : 'verify-phone'
        });
        
        // Redirect based on phone verification status
        if (!isPhoneVerified && response.user?.phone) {
          // Redirect to phone verification if phone exists but not verified
          navigate('/verify-phone', {
            state: {
              phone: response.user.phone,
              message: 'Please verify your phone number to continue using your account.'
            }
          });
        } else if (!isPhoneVerified) {
          // If no phone number, redirect to profile to add one
          navigate('/profile', {
            state: {
              message: 'Please add and verify your phone number to secure your account.'
            }
          });
        } else {
          // Phone is verified, go to dashboard
          navigate('/dashboard');
        }
      }
      
    } catch (error) {
      // Handle different types of errors
      let errorMsg = 'Login failed. Please try again.';
      let fieldErrors = {};
      let showRegisterLink = false;
      
      if (error.status === 401) {
        errorMsg = 'The credentials you entered don\'t match our records. Please double-check your information and try again.';
        fieldErrors = {
          identifier: 'Please verify this information',
          password: 'Please verify this information'
        };
      } else if (error.status === 404) {
        const identifierType = loginType === 'email' ? 'email address' : 'phone number';
        errorMsg = `We couldn't find an account with this ${identifierType}. You can create a new account if you'd like.`;
        fieldErrors = {
          identifier: `No account found with this ${identifierType}`
        };
        showRegisterLink = true;
      } else if (error.status === 422) {
        errorMsg = 'There seems to be an issue with the information provided. Please review and try again.';
        // Try to extract field-specific errors from response
        if (error.data?.detail && Array.isArray(error.data.detail)) {
          error.data.detail.forEach(err => {
            if (err.loc && err.loc.length > 1) {
              const field = err.loc[err.loc.length - 1];
              if (field === 'identifier') {
                fieldErrors.identifier = err.msg || 'Please check this field';
              } else if (field === 'password') {
                fieldErrors.password = err.msg || 'Please check this field';
              }
            }
          });
        }
      } else if (error.status >= 500) {
        errorMsg = 'We\'re experiencing technical difficulties. Please try again in a few moments.';
      } else if (error.name === 'TypeError' || error.message.includes('fetch')) {
        errorMsg = 'Unable to connect. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMsg = error.message;
      }

      // Set error states
      setErrors({
        general: errorMsg,
        showRegisterLink,
        ...fieldErrors
      });
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-600">
          Sign in with your email or phone number
        </p>
      </div>

      {/* Error display */}
      {Object.keys(errors).length > 0 && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '2px solid #f87171',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          color: '#dc2626'
        }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>
            Unable to sign in
          </h4>
          {errors.general && <p style={{ marginBottom: '8px', lineHeight: '1.4' }}>{errors.general}</p>}
          {(errors.identifier || errors.password) && (
            <div style={{ marginTop: '8px', fontSize: '14px', color: '#b91c1c' }}>
              {errors.identifier && <p style={{ marginBottom: '4px' }}>Email/Phone: {errors.identifier}</p>}
              {errors.password && <p style={{ marginBottom: '4px' }}>Password: {errors.password}</p>}
            </div>
          )}
          
          {errors.showRegisterLink && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f87171' }}>
              <Link
                to="/register"
                state={{ 
                  initialData: {
                    [loginType]: formData.identifier
                  }
                }}
                style={{
                  color: '#2563eb',
                  textDecoration: 'underline',
                  fontWeight: 'bold'
                }}
              >
                Create Account Instead
              </Link>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Login Type Toggle */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                setLoginType('email');
                setFormData(prev => ({ ...prev, identifier: '' }));
                setErrors({});
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                loginType === 'email'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
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
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Phone
            </button>
          </div>
        </div>

        {/* Identifier Input */}
        <div>
          {loginType === 'email' ? (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={formData.identifier}
                onChange={(e) => handleInputChange('identifier', e.target.value)}
                disabled={loading}
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.identifier ? '2px solid #f87171' : '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: errors.identifier ? '#fef2f2' : 'white',
                  color: errors.identifier ? '#dc2626' : '#111827',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  if (!errors.identifier) {
                    e.target.style.borderColor = '#3b82f6';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.identifier) {
                    e.target.style.borderColor = '#d1d5db';
                  }
                }}
              />
              {errors.identifier && (
                <div style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626' }}>
                  {errors.identifier}
                </div>
              )}
            </>
          ) : (
            <PhoneInputWithCountry
              label="Phone Number"
              placeholder="Enter your phone number"
              value={formData.identifier}
              onChange={(e) => handleInputChange('identifier', e.target.value)}
              error={errors.identifier}
              required={true}
              disabled={loading}
              defaultCountry="KE"
              className="phone-input-login"
            />
          )}
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            style={{
              width: '100%',
              padding: '12px',
              border: errors.password ? '2px solid #f87171' : '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              backgroundColor: errors.password ? '#fef2f2' : 'white',
              color: errors.password ? '#dc2626' : '#111827',
              outline: 'none'
            }}
            onFocus={(e) => {
              if (!errors.password) {
                e.target.style.borderColor = '#3b82f6';
              }
            }}
            onBlur={(e) => {
              if (!errors.password) {
                e.target.style.borderColor = '#d1d5db';
              }
            }}
          />
          {errors.password && (
            <div style={{ marginTop: '4px', fontSize: '14px', color: '#dc2626' }}>
              {errors.password}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '48px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = '#2563eb';
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = '#3b82f6';
            }
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #ffffff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '8px'
              }}></div>
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Create one here
            </Link>
          </p>
        </div>
      </form>



      {/* CSS for spinner animation and phone input styling */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Custom styling for phone input to match our form design */
        .phone-input-login .relative > div {
          border-radius: 8px;
        }
        
        .phone-input-login .relative > div > div > button {
          border: 2px solid ${errors.identifier ? '#f87171' : '#d1d5db'};
          border-right: none;
          border-radius: 8px 0 0 8px;
          padding: 12px;
          background-color: ${errors.identifier ? '#fef2f2' : 'white'};
        }
        
        .phone-input-login .relative > div > input {
          border: 2px solid ${errors.identifier ? '#f87171' : '#d1d5db'};
          border-left: none;
          border-radius: 0 8px 8px 0;
          padding: 12px;
          font-size: 16px;
          background-color: ${errors.identifier ? '#fef2f2' : 'white'};
          color: ${errors.identifier ? '#dc2626' : '#111827'};
        }
        
        .phone-input-login .relative > div > input:focus {
          border-color: ${errors.identifier ? '#f87171' : '#3b82f6'};
          outline: none;
        }
        
        .phone-input-login .relative > div > div > button:focus {
          border-color: ${errors.identifier ? '#f87171' : '#3b82f6'};
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default LoginForm;