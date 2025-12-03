import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, CheckCircle } from 'lucide-react';
import authClient from '../../api/authClient';
import useAuth from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from '../common/ErrorMessage';

const ProfileEditForm = ({ initialData, onSuccess, onCancel }) => {
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || initialData.first_name || '',
        lastName: initialData.lastName || initialData.last_name || ''
      });
    }
  }, [initialData]);

  // Validate form data
  const validateForm = () => {
    const errors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    } else if (formData.firstName.trim().length > 50) {
      errors.firstName = 'First name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName.trim())) {
      errors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    } else if (formData.lastName.trim().length > 50) {
      errors.lastName = 'Last name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName.trim())) {
      errors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
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
      // Prepare data for API
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim()
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
      console.error('Profile update failed:', err);
      
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

  // Handle cancel
  const handleCancel = () => {
    // Reset form to initial state
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || initialData.first_name || '',
        lastName: initialData.lastName || initialData.last_name || ''
      });
    }
    
    setValidationErrors({});
    setError(null);
    setSuccess(false);
    
    onCancel?.();
  };

  // Check if form has changes
  const hasChanges = () => {
    if (!initialData) return false;
    
    const originalFirstName = initialData.firstName || initialData.first_name || '';
    const originalLastName = initialData.lastName || initialData.last_name || '';
    
    return (
      formData.firstName.trim() !== originalFirstName ||
      formData.lastName.trim() !== originalLastName
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 p-4 bg-success-50 border border-success-200 rounded-lg flex items-center"
        >
          <CheckCircle className="w-5 h-5 text-success-600 mr-3" />
          <div>
            <p className="text-success-800 font-medium">Profile updated successfully!</p>
            <p className="text-success-600 text-sm">Your changes have been saved.</p>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First Name */}
        <Input
          type="text"
          label="First Name"
          value={formData.firstName}
          onChange={handleInputChange('firstName')}
          error={validationErrors.firstName}
          placeholder="Enter your first name"
          disabled={loading || success}
          required
          maxLength={50}
        />

        {/* Last Name */}
        <Input
          type="text"
          label="Last Name"
          value={formData.lastName}
          onChange={handleInputChange('lastName')}
          error={validationErrors.lastName}
          placeholder="Enter your last name"
          disabled={loading || success}
          required
          maxLength={50}
        />

        {/* Form Actions */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!hasChanges() || success}
            className="flex-1 flex items-center justify-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={loading}
            className="flex items-center justify-center"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>

        {/* Form Info */}
        <div className="text-xs text-secondary-500 text-center pt-2">
          {hasChanges() ? (
            <span className="text-warning-600">You have unsaved changes</span>
          ) : (
            <span>Make changes to update your profile</span>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default ProfileEditForm;