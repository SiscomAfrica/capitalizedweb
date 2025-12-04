import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  MapPin, 
  Home, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

// Components
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ErrorMessage from '../../components/common/ErrorMessage';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Hooks and API
import useAuth from '../../hooks/useAuth';
import useOnboarding from '../../hooks/useOnboarding';
import authClient from '../../api/authClient';

const ProfileCompletionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();
  const { getNextStepMessage, progress } = useOnboarding();

  const [formData, setFormData] = useState({
    dateOfBirth: '',
    country: '',
    city: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setFormData({
        dateOfBirth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
        country: user.country || '',
        city: user.city || '',
        address: user.address || ''
      });

      // If profile is already completed, redirect to dashboard
      if (user.profile_completed || user.profileCompleted) {
        const from = location.state?.from || '/dashboard';
        navigate(from, { replace: true });
      }
    }
  }, [user, navigate, location.state]);

  // Validate form data
  const validateForm = () => {
    const errors = {};

    // Date of birth validation
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18) {
        errors.dateOfBirth = 'You must be at least 18 years old';
      } else if (age > 120) {
        errors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }

    // Country validation
    if (!formData.country.trim()) {
      errors.country = 'Country is required';
    } else if (formData.country.trim().length < 2) {
      errors.country = 'Country must be at least 2 characters';
    }

    // City validation
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    } else if (formData.city.trim().length < 2) {
      errors.city = 'City must be at least 2 characters';
    }

    // Address validation
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      errors.address = 'Address must be at least 10 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    // Clear general error
    if (error) {
      setError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare data for API
      const updateData = {
        date_of_birth: new Date(formData.dateOfBirth).toISOString(),
        country: formData.country.trim(),
        city: formData.city.trim(),
        address: formData.address.trim()
      };

      // Call API to update profile
      const response = await authClient.updateProfile(updateData);

      // Update user context
      updateUser({
        ...response,
        profile_completed: true,
        profileCompleted: true
      });

      setSuccess(true);

      // Navigate to dashboard after a short delay (streamlined flow)
      setTimeout(() => {
        const from = location.state?.from || '/dashboard';
        navigate(from, { replace: true });
      }, 1500);

    } catch (err) {
      console.error('Profile completion failed:', err);
      
      if (err.response?.status === 400) {
        const serverErrors = err.response.data?.errors || {};
        setValidationErrors(serverErrors);
        setError('Please correct the errors below');
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError(err.message || 'Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/dashboard');
  };

  // Check if form is complete
  const isFormComplete = () => {
    return formData.dateOfBirth && 
           formData.country.trim() && 
           formData.city.trim() && 
           formData.address.trim();
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">
              Complete Your Profile
            </h1>
            <p className="text-secondary-600">
              {getNextStepMessage()}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-secondary-600 mb-2">
              <span>Onboarding Progress</span>
              <span>{progress.percentage}%</span>
            </div>
            <div className="w-full bg-secondary-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-primary-500 transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-secondary-500 mt-2">
              <span>Phone Verified ✓</span>
              <span className={isFormComplete() ? 'text-primary-600 font-medium' : ''}>
                Profile {isFormComplete() ? '✓' : ''}
              </span>
              <span>Dashboard Access</span>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg flex items-center"
            >
              <CheckCircle className="w-5 h-5 text-success-600 mr-3" />
              <div>
                <p className="text-success-800 font-medium">Profile completed successfully!</p>
                <p className="text-success-600 text-sm">You can now access your dashboard and start investing...</p>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6">
              <ErrorMessage message={error} />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date of Birth */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-secondary-500" />
                <label className="text-sm font-medium text-secondary-700">
                  Date of Birth
                </label>
              </div>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange('dateOfBirth')}
                error={validationErrors.dateOfBirth}
                disabled={loading || success}
                required
                max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-secondary-500" />
                <label className="text-sm font-medium text-secondary-700">
                  Country
                </label>
              </div>
              <Input
                type="text"
                value={formData.country}
                onChange={handleInputChange('country')}
                error={validationErrors.country}
                placeholder="Enter your country"
                disabled={loading || success}
                required
                maxLength={100}
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-secondary-500" />
                <label className="text-sm font-medium text-secondary-700">
                  City
                </label>
              </div>
              <Input
                type="text"
                value={formData.city}
                onChange={handleInputChange('city')}
                error={validationErrors.city}
                placeholder="Enter your city"
                disabled={loading || success}
                required
                maxLength={100}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Home className="w-4 h-4 text-secondary-500" />
                <label className="text-sm font-medium text-secondary-700">
                  Address
                </label>
              </div>
              <textarea
                value={formData.address}
                onChange={handleInputChange('address')}
                placeholder="Enter your full address"
                disabled={loading || success}
                required
                maxLength={500}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  validationErrors.address 
                    ? 'border-error-300 focus:ring-error-500 focus:border-error-500' 
                    : 'border-secondary-300'
                } ${
                  loading || success ? 'bg-secondary-50 cursor-not-allowed' : 'bg-white'
                }`}
              />
              {validationErrors.address && (
                <p className="text-sm text-error-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.address}
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                disabled={loading || success}
                className="flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={!isFormComplete() || success}
                className="flex-1 flex items-center justify-center"
              >
                {loading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Saving...' : 'Complete Profile'}
              </Button>
            </div>

            {/* Info Note */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary-600 mt-0.5" />
                <div className="text-sm">
                  <p className="text-primary-800 font-medium mb-1">
                    Why do we need this information?
                  </p>
                  <p className="text-primary-700">
                    This information helps us provide you with personalized investment 
                    opportunities and comply with financial regulations. All data is 
                    securely encrypted and protected.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProfileCompletionPage;