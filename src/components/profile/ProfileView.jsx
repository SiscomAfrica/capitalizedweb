import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Shield, Edit, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import authClient from '../../api/authClient';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Button from '../common/Button';
import Card from '../common/Card';

const ProfileView = ({ onEditProfile, onUploadKYC }) => {
  const { user: contextUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profileData = await authClient.getProfile();
      setProfile(profileData);
      
      // Update context user data if needed
      if (profileData && contextUser) {
        updateUser(profileData);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [contextUser, updateUser]);

  // Load profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Use context user as fallback if profile is not loaded yet
  const userData = profile || contextUser;

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get KYC status display info
  const getKYCStatusInfo = (status) => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          text: 'Verified',
          color: 'text-success-600',
          bgColor: 'bg-success-100',
          description: 'Your identity has been verified'
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'Under Review',
          color: 'text-warning-600',
          bgColor: 'bg-warning-100',
          description: 'Your documents are being reviewed'
        };
      case 'rejected':
        return {
          icon: XCircle,
          text: 'Rejected',
          color: 'text-error-600',
          bgColor: 'bg-error-100',
          description: 'Please resubmit your documents'
        };
      default:
        return {
          icon: Shield,
          text: 'Not Submitted',
          color: 'text-secondary-600',
          bgColor: 'bg-secondary-100',
          description: 'Upload your identity documents'
        };
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="p-6">
        <ErrorMessage 
          message={error}
          onRetry={fetchProfile}
        />
      </Card>
    );
  }

  // No user data
  if (!userData) {
    return (
      <Card className="p-6">
        <ErrorMessage 
          message="No profile data available"
          onRetry={fetchProfile}
        />
      </Card>
    );
  }

  const kycStatus = getKYCStatusInfo(userData.kycStatus || userData.kyc_status);
  const KYCIcon = kycStatus.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">
                {userData.firstName || userData.first_name} {userData.lastName || userData.last_name}
              </h1>
              <p className="text-secondary-600">
                Member since {formatDate(userData.createdAt || userData.created_at)}
              </p>
            </div>
          </div>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={onEditProfile}
            className="flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-secondary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-700">Email Address</p>
              <p className="text-secondary-900">{userData.email}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-secondary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-700">Phone Number</p>
              <div className="flex items-center space-x-2">
                <p className="text-secondary-900">{userData.phone}</p>
                {userData.isPhoneVerified || userData.is_phone_verified ? (
                  <CheckCircle className="w-4 h-4 text-success-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-error-600" />
                )}
              </div>
            </div>
          </div>

          {/* Account Creation Date */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-secondary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-700">Account Created</p>
              <p className="text-secondary-900">{formatDate(userData.createdAt || userData.created_at)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* KYC Status Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 ${kycStatus.bgColor} rounded-lg flex items-center justify-center`}>
              <KYCIcon className={`w-6 h-6 ${kycStatus.color}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                Identity Verification
              </h3>
              <div className="flex items-center space-x-2 mb-2">
                <span className={`text-sm font-medium ${kycStatus.color}`}>
                  {kycStatus.text}
                </span>
              </div>
              <p className="text-sm text-secondary-600">
                {kycStatus.description}
              </p>
            </div>
          </div>

          {/* KYC Action Button */}
          {(userData.kycStatus === 'not_submitted' || 
            userData.kyc_status === 'not_submitted' || 
            userData.kycStatus === 'rejected' || 
            userData.kyc_status === 'rejected' ||
            !userData.kycStatus && !userData.kyc_status) && (
            <Button
              variant="primary"
              size="sm"
              onClick={onUploadKYC}
              className="flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
          )}
        </div>

        {/* KYC Benefits */}
        {(userData.kycStatus === 'not_submitted' || 
          userData.kyc_status === 'not_submitted' ||
          !userData.kycStatus && !userData.kyc_status) && (
          <div className="mt-4 p-4 bg-primary-50 rounded-lg">
            <h4 className="text-sm font-medium text-primary-900 mb-2">
              Complete your verification to:
            </h4>
            <ul className="text-sm text-primary-700 space-y-1">
              <li>• Make investment inquiries</li>
              <li>• Access premium investment products</li>
              <li>• Withdraw earnings from your portfolio</li>
              <li>• Subscribe to premium plans</li>
            </ul>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default ProfileView;