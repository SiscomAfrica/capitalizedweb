import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, MapPin, Calendar, Home, CheckCircle, AlertCircle } from 'lucide-react';
import authClient from '../../api/authClient';
import useAuth from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from '../common/ErrorMessage';
import Card from '../common/Card';

const ProfileCompletionForm = ({ onSuccess, onSkip }) => {
  const { user, updateUser } = useAuth();
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
    }
  }, [user]);

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
    } else if (formData.country.trim().length > 100) {
      errors.country = 'Country must be less than 100 characters';
    }

    // City validation
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    } else if (formData.city.trim().length < 2) {
      errors.city = 'City must be at least 2 characters';
    } else if (formData.city.trim().length > 100) {
      errors.city = 'City must be less than 100 characters';
    }

    // Address validation
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      errors.address = 'Address must be at least 10 characters';
    } else if (formData.address.trim().length > 500) {
      errors.address = 'Address must be less than 500 characters';
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

    // Clear success message
    if (success) {
      setSuccess(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepare data for API (convert date to ISO string)
      const updateData = {
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        country: formData.country.trim(),
        city: formData.city.trim(),
        address: formData.address.trim()
      };

      // Call API to update profile
      const updatedProfile = await authClient.updateProfile(updateData);

      // Update user context
      updateUser(updatedProfile);

      // Show success message
      setSuccess(true);

      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess?.(updatedProfile);
      }, 1500);

    } catch (err) {
      console.error('Profile completion failed:', err);
      
      // Handle different types of errors
      if (err.response?.status === 400) {
        // Validation errors from server
        const serverErrors = err.response.data?.errors || {};
        setValidationErrors(serverErrors);
        setError('Please correct the errors below');
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to update this profile.');
      } else {
        setError(err.message || 'Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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
              Please provide the following information to access your dashboard. 
              You can upload identity documents later.
            </p>
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
                <p className="text-success-600 text-sm">Redirecting to your dashboard...</p>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6">
              <ErrorMessage message={error} />
            </div>
          )}

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-secondary-600 mb-2">
              <span>Profile Completion</span>
              <span>{isFormComplete() ? '100%' : '0%'}</span>
            </div>
            <div className="w-full bg-secondary-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isFormComplete() ? 'bg-success-500 w-full' : 'bg-primary-500 w-0'
                }`}
              />
            </div>
          </div>

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
                type="submit"
                variant="primary"
                loading={loading}
                disabled={!isFormComplete() || success}
                className="flex-1 flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Complete Profile'}
              </Button>

              {onSkip && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onSkip}
                  disabled={loading || success}
                  className="flex items-center justify-center"
                >
                  Skip for Now
                </Button>
              )}
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
                    opportunities and comply with financial regulations. You can upload 
                    identity documents later for KYC verification.
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

export default ProfileCompletionForm;