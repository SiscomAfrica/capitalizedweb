import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProfileView from '../../components/profile/ProfileView';
import ProfileEditForm from '../../components/profile/ProfileEditForm';
import KYCUpload from '../../components/profile/KYCUpload';
import Modal from '../../components/common/Modal';
import useAuth from '../../hooks/useAuth';

const ProfilePage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);

  // Check if we should open KYC modal based on URL params
  React.useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'kyc') {
      setShowKYCModal(true);
      // Clear the URL parameter
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Handle edit profile
  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  // Handle edit profile success
  const handleEditSuccess = () => {
    setShowEditModal(false);
    // ProfileView will automatically refresh with updated data from context
  };

  // Handle edit profile cancel
  const handleEditCancel = () => {
    setShowEditModal(false);
  };

  // Handle KYC upload
  const handleUploadKYC = () => {
    setShowKYCModal(true);
  };

  // Handle KYC upload success
  const handleKYCSuccess = () => {
    setShowKYCModal(false);
    // ProfileView will automatically refresh with updated KYC status from context
  };

  // Handle KYC modal close
  const handleKYCClose = () => {
    setShowKYCModal(false);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen bg-secondary-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                My Profile
              </h1>
              <p className="text-secondary-600">
                Manage your account information and identity verification
              </p>
            </motion.div>

            {/* Profile Content */}
            <ProfileView
              onEditProfile={handleEditProfile}
              onUploadKYC={handleUploadKYC}
            />

            {/* Edit Profile Modal */}
            <Modal
              isOpen={showEditModal}
              onClose={handleEditCancel}
              title="Edit Profile"
              size="md"
            >
              <ProfileEditForm
                initialData={user}
                onSuccess={handleEditSuccess}
                onCancel={handleEditCancel}
              />
            </Modal>

            {/* KYC Upload Modal */}
            <Modal
              isOpen={showKYCModal}
              onClose={handleKYCClose}
              title="Identity Verification"
              size="lg"
            >
              <div className="mb-4">
                <p className="text-secondary-600 text-sm">
                  Upload clear photos or scans of your government-issued identity documents 
                  to verify your account and unlock all platform features.
                </p>
              </div>
              
              <KYCUpload onSuccess={handleKYCSuccess} />
            </Modal>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ProfilePage;