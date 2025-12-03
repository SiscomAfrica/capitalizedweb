import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Shield, Edit, Upload, CheckCircle, Clock, XCircle, Eye, X, FileText, Image as ImageIcon, File } from 'lucide-react';
import authClient from '../../api/authClient';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Button from '../common/Button';
import Card from '../common/Card';

const ProfileView = ({ onEditProfile }) => {
  const { user: contextUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // KYC Document Upload States
  const [documents, setDocuments] = useState({
    identity: null,
    identityBack: null,
    proofOfAddress: null
  });
  const [uploading, setUploading] = useState({
    identity: false,
    identityBack: false,
    proofOfAddress: false
  });
  const [uploadProgress, setUploadProgress] = useState({
    identity: 0,
    identityBack: 0,
    proofOfAddress: 0
  });
  const [uploadErrors, setUploadErrors] = useState({
    identity: null,
    identityBack: null,
    proofOfAddress: null
  });
  const [uploadSuccess, setUploadSuccess] = useState({
    identity: false,
    identityBack: false,
    proofOfAddress: false
  });
  const [dragActive, setDragActive] = useState({
    identity: false,
    identityBack: false,
    proofOfAddress: false
  });

  // File input refs
  const identityInputRef = useRef(null);
  const identityBackInputRef = useRef(null);
  const proofOfAddressInputRef = useRef(null);

  // Document type configurations
  const DOCUMENT_TYPES = {
    identity: {
      title: 'Government ID (Front)',
      description: 'Front side of your National ID, Passport, or Driver\'s License',
      ref: identityInputRef
    },
    identityBack: {
      title: 'Government ID (Back)',
      description: 'Back side of your ID (if applicable)',
      ref: identityBackInputRef
    },
    proofOfAddress: {
      title: 'Proof of Address',
      description: 'Utility bill, bank statement, or rental agreement (not older than 3 months)',
      ref: proofOfAddressInputRef
    }
  };

  // File validation constants
  const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profileData = await authClient.getProfile();
      setProfile(profileData);
      
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies to prevent re-creation

  // Load profile data on component mount only
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

  // File validation
  const validateFile = (file) => {
    const errors = [];
    if (!ACCEPTED_TYPES.includes(file.type)) {
      errors.push('File type not supported. Please upload PDF, JPG, or PNG files.');
    }
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
    }
    if (file.name.length > 100) {
      errors.push('File name too long. Please rename the file.');
    }
    return errors;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (file) => {
    if (file.type === 'application/pdf') return FileText;
    if (file.type.startsWith('image/')) return ImageIcon;
    return File;
  };

  // Handle file selection
  const handleFileSelect = useCallback((file, documentType) => {
    if (!file) return;

    const validationErrors = validateFile(file);
    if (validationErrors.length > 0) {
      setUploadErrors(prev => ({
        ...prev,
        [documentType]: validationErrors.join(' ')
      }));
      return;
    }

    // Clean up previous file preview
    const previousFile = documents[documentType];
    if (previousFile?.preview) {
      URL.revokeObjectURL(previousFile.preview);
    }

    // Create new file object
    const fileData = {
      file,
      id: Math.random().toString(36).substring(2, 11),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      type: documentType
    };

    setDocuments(prev => ({ ...prev, [documentType]: fileData }));
    setUploadErrors(prev => ({ ...prev, [documentType]: null }));
    setUploadSuccess(prev => ({ ...prev, [documentType]: false }));
  }, [documents]);

  // Handle drag events
  const handleDrag = useCallback((e, documentType) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(prev => ({ ...prev, [documentType]: true }));
    } else if (e.type === 'dragleave') {
      setDragActive(prev => ({ ...prev, [documentType]: false }));
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e, documentType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [documentType]: false }));
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0], documentType);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = (e, documentType) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0], documentType);
    }
  };

  // Remove file
  const removeFile = (documentType) => {
    const fileToRemove = documents[documentType];
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setDocuments(prev => ({ ...prev, [documentType]: null }));
    setUploadErrors(prev => ({ ...prev, [documentType]: null }));
    setUploadSuccess(prev => ({ ...prev, [documentType]: false }));
  };

  // Preview file
  const previewFile = (fileData) => {
    if (fileData.preview) {
      window.open(fileData.preview, '_blank');
    } else if (fileData.file.type === 'application/pdf') {
      const url = URL.createObjectURL(fileData.file);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  // Handle document upload
  const handleDocumentUpload = async (documentType) => {
    const document = documents[documentType];
    if (!document) {
      setUploadErrors(prev => ({
        ...prev,
        [documentType]: 'Please select a file to upload.'
      }));
      return;
    }

    setUploading(prev => ({ ...prev, [documentType]: true }));
    setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
    setUploadErrors(prev => ({ ...prev, [documentType]: null }));
    setUploadSuccess(prev => ({ ...prev, [documentType]: false }));

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [documentType]: Math.min(prev[documentType] + Math.random() * 15, 90)
        }));
      }, 200);

      // Upload file
      const response = await authClient.submitKYC([document.file]);

      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [documentType]: 100 }));
      updateUser({ kycStatus: 'pending' });
      setUploadSuccess(prev => ({ ...prev, [documentType]: true }));

    } catch (err) {
      console.error(`${documentType} upload failed:`, err);
      let errorMessage = 'Upload failed. Please try again.';
      
      if (err.response?.status === 400) {
        errorMessage = err.response.data?.message || 'Invalid file. Please check your document and try again.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (err.response?.status === 413) {
        errorMessage = 'File too large. Please reduce file size and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setUploadErrors(prev => ({ ...prev, [documentType]: errorMessage }));
      setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      Object.values(documents).forEach(doc => {
        if (doc?.preview) {
          URL.revokeObjectURL(doc.preview);
        }
      });
    };
  }, [documents]);

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

      {/* KYC Status Header */}
      <Card className="p-6">
        <div className="flex items-center space-x-4 mb-4">
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

        {/* KYC Benefits */}
        {(userData.kycStatus === 'not_submitted' || 
          userData.kyc_status === 'not_submitted' ||
          !userData.kycStatus && !userData.kyc_status) && (
          <div className="p-4 bg-primary-50 rounded-lg">
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

      {/* Document Upload Sections */}
      <div className="space-y-6">
        {Object.entries(DOCUMENT_TYPES).map(([documentType, config]) => {
          const currentFile = documents[documentType];
          const isActive = dragActive[documentType];
          const isUploading = uploading[documentType];
          const progress = uploadProgress[documentType];
          const error = uploadErrors[documentType];
          const isSuccess = uploadSuccess[documentType];
          
          return (
            <Card key={documentType} className="p-6">
              {/* Document Type Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h4 className="text-lg font-semibold text-secondary-900">
                    {config.title}
                  </h4>
                  <span className="text-xs text-secondary-500 font-medium px-2 py-1 bg-secondary-100 rounded">
                    Optional
                  </span>
                </div>
                
                {isSuccess && (
                  <div className="flex items-center text-success-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Uploaded Successfully</span>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-secondary-600 mb-4">
                {config.description}
              </p>

              {/* Error Message */}
              {error && (
                <div className="mb-4">
                  <ErrorMessage message={error} />
                </div>
              )}

              {/* Upload Area */}
              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 mb-4
                  ${isActive 
                    ? 'border-primary-400 bg-primary-50' 
                    : currentFile 
                      ? isSuccess 
                        ? 'border-success-300 bg-success-50'
                        : 'border-secondary-300 bg-secondary-50'
                      : 'border-secondary-300 hover:border-secondary-400'
                  }
                  ${isUploading ? 'pointer-events-none opacity-50' : ''}
                `}
                onDragEnter={(e) => handleDrag(e, documentType)}
                onDragLeave={(e) => handleDrag(e, documentType)}
                onDragOver={(e) => handleDrag(e, documentType)}
                onDrop={(e) => handleDrop(e, documentType)}
              >
                <input
                  ref={config.ref}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileInputChange(e, documentType)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                
                {currentFile ? (
                  // File Selected State
                  <div className="space-y-3">
                    <CheckCircle className={`w-10 h-10 mx-auto ${isSuccess ? 'text-success-600' : 'text-secondary-600'}`} />
                    <div>
                      <p className={`text-sm font-medium ${isSuccess ? 'text-success-800' : 'text-secondary-800'}`}>
                        {currentFile.file.name}
                      </p>
                      <p className={`text-xs ${isSuccess ? 'text-success-600' : 'text-secondary-600'}`}>
                        {formatFileSize(currentFile.file.size)}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => previewFile(currentFile)}
                        className="flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => config.ref.current?.click()}
                        disabled={isUploading}
                        className="flex items-center"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Replace
                      </Button>
                      
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => removeFile(documentType)}
                        disabled={isUploading}
                        className="flex items-center text-error-600 hover:text-error-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Empty State
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-secondary-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-secondary-900 mb-2">
                        Drop file here or click to browse
                      </p>
                      <p className="text-sm text-secondary-600 mb-4">
                        PDF, JPG, PNG (max 5MB)
                      </p>
                    </div>
                    
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={() => config.ref.current?.click()}
                      disabled={isUploading}
                      className="flex items-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3 mb-4"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary-700">Uploading {config.title.toLowerCase()}...</span>
                    <span className="text-secondary-600">{Math.round(progress)}%</span>
                  </div>
                  
                  <div className="w-full bg-secondary-200 rounded-full h-2">
                    <motion.div
                      className="bg-primary-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-center py-2">
                    <LoadingSpinner size="sm" className="mr-2" />
                    <span className="text-sm text-secondary-600">
                      Please wait...
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Upload Button */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  loading={isUploading}
                  disabled={!currentFile || isSuccess}
                  onClick={() => handleDocumentUpload(documentType)}
                  className="min-w-[140px] flex items-center"
                >
                  {isUploading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Uploading...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Uploaded
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ProfileView;