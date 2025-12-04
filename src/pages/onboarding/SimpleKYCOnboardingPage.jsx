import React from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleKYCOnboarding from '../../components/onboarding/SimpleKYCOnboarding';
import useAuth from '../../hooks/useAuth';

/**
 * SimpleKYCOnboardingPage
 * Page wrapper for the simplified KYC onboarding flow
 */
const SimpleKYCOnboardingPage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleOnboardingComplete = async () => {
    // Refresh user data to get updated subscription status
    await refreshUser();
    
    // Navigate to dashboard
    navigate('/dashboard', { replace: true });
  };

  return (
    <SimpleKYCOnboarding onComplete={handleOnboardingComplete} />
  );
};

export default SimpleKYCOnboardingPage;