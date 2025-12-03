import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import ProfileCompletionForm from '../../components/profile/ProfileCompletionForm';

const ProfileCompletionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle successful profile completion
  const handleSuccess = () => {
    // Redirect to the originally requested page or dashboard
    const from = location.state?.from || '/dashboard';
    navigate(from, { replace: true });
  };

  // Handle skip (if allowed)
  const handleSkip = () => {
    // For now, we don't allow skipping - redirect to profile page
    navigate('/profile', { replace: true });
  };

  return (
    <ProtectedRoute>
      <ProfileCompletionForm 
        onSuccess={handleSuccess}
        // onSkip={handleSkip} // Uncomment if you want to allow skipping
      />
    </ProtectedRoute>
  );
};

export default ProfileCompletionPage;