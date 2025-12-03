import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Image as ImageIcon,
  Trash2,
  Eye
} from 'lucide-react';
import authClient from '../../api/authClient';
import useAuth from '../../hooks/useAuth';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';

const KYCUpload = ({ onSuccess }) => {
  const { updateUser } = useAuth();
  const [documents, setDocuments] = useState({
    identity: null,      // Government ID (front)
    identityBack: null,  // Government ID (back) - optional
    proofOfAddress: null // Proof of address document
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
  const [errors, setErrors] = useState({
    identity: null,
    identityBack: null,
    proofOfAddress: null
  });
  const [success, setSuccess] = useState({
    identity: false,
    identityBack: false,
    proofOfAddress: false
  });
  const [dragActive, setDragActive] = useState({
    identity: false,
    identityBack: false,
    proofOfAddress: false
  });
  
  // File input refs for each document type
  const identityInputRef = useRef(null);
  const identityBackInputRef = useRef(null);
  const proofOfAddressInputRef = useRef(null);

  // Accepted file types
  const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

  // Document type configurations
  const DOCUMENT_TYPES = {
    identity: {
      title: 'Government ID (Front)',
      description: 'Front side of your National ID, Passport, or Driver\'s License',
      required: false,
      ref: identityInputRef
    },
    identityBack: {
      title: 'Government ID (Back)',
      description: 'Back side of your ID (if applicable)',
      required: false,
      ref: identityBackInputRef
    },
    proofOfAddress: {
      title: 'Proof of Address',
      description: 'Utility bill, bank statement, or rental agreement (not older than 3 months)',
      required: false,
      ref: proofOfAddressInputRef
    }
  };

  // Validate file
  const validateFile = (file) => {
    const errors = [];

    // Check file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      errors.push('File type not supported. Please upload PDF, JPG, or PNG files.');
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
    }

    // Check file name length
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
    if (file.type === 'application/pdf') {
      return FileText;
    } else if (file.type.startsWith('image/')) {
      return ImageIcon;
    }
    return File;
  };

  // Handle file selection for specific document type
  const handleFileSelect = useCallback((file, documentType) => {
    if (!file) return;

    const validationErrors = validateFile(file);
    
    if (validationErrors.length > 0) {
      setErrors(prev => ({
        ...prev,
        [documentType]: `${DOCUMENT_TYPES[documentType].title}: ${validationErrors.join(' ')}`
      }));
      return;
    }

    // Clean up previous file preview if exists
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

    setDocuments(prev => ({
      ...prev,
      [documentType]: fileData
    }));
    
    // Clear error for this document type
    setErrors(prev => ({
      ...prev,
      [documentType]: null
    }));

    // Clear success state when new file is selected
    setSuccess(prev => ({
      ...prev,
      [documentType]: false
    }));
  }, [documents]);

  // Handle drag events for specific document type
  const handleDrag = useCallback((e, documentType) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(prev => ({ ...prev, [documentType]: true }));
    } else if (e.type === 'dragleave') {
      setDragActive(prev => ({ ...prev, [documentType]: false }));
    }
  }, []);

  // Handle drop for specific document type
  const handleDrop = useCallback((e, documentType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [documentType]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0], documentType);
    }
  }, [handleFileSelect]);

  // Handle file input change for specific document type
  const handleFileInputChange = (e, documentType) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0], documentType);
    }
  };

  // Remove file for specific document type
  const removeFile = (documentType) => {
    const fileToRemove = documents[documentType];
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    
    setDocuments(prev => ({
      ...prev,
      [documentType]: null
    }));
    
    // Clear error and success for this document type
    setErrors(prev => ({
      ...prev,
      [documentType]: null
    }));
    
    setSuccess(prev => ({
      ...prev,
      [documentType]: false
    }));
  };

  // Preview file
  const previewFile = (fileData) => {
    if (fileData.preview) {
      // Open image preview in new tab
      window.open(fileData.preview, '_blank');
    } else if (fileData.file.type === 'application/pdf') {
      // Create temporary URL for PDF preview
      const url = URL.createObjectURL(fileData.file);
      window.open(url, '_blank');
      // Clean up URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  // Handle individual document upload
  const handleDocumentUpload = async (documentType) => {
    const document = documents[documentType];
    
    if (!document) {
      setErrors(prev => ({
        ...prev,
        [documentType]: 'Please select a file to upload.'
      }));
      return;
    }

    setUploading(prev => ({ ...prev, [documentType]: true }));
    setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
    setErrors(prev => ({ ...prev, [documentType]: null }));
    setSuccess(prev => ({ ...prev, [documentType]: false }));

    try {
      // Simulate progress (since we don't have real progress from the API)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [documentType]: Math.min(prev[documentType] + Math.random() * 15, 90)
        }));
      }, 200);

      // Upload single file
      const response = await authClient.submitKYC([document.file]);

      // Clear progress interval
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [documentType]: 100 }));

      // Update user context with new KYC status
      updateUser({ kycStatus: 'pending' });

      // Show success for this document
      setSuccess(prev => ({ ...prev, [documentType]: true }));

      // Call success callback
      onSuccess?.(response);

    } catch (err) {
      console.error(`${documentType} upload failed:`, err);
      
      // Handle different types of errors
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
      
      setErrors(prev => ({
        ...prev,
        [documentType]: errorMessage
      }));
      
      setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
    }
  };

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      Object.values(documents).forEach(doc => {
        if (doc?.preview) {
          URL.revokeObjectURL(doc.preview);
        }
      });
    };
  }, [documents]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Global Success Message */}
      {Object.values(success).some(s => s) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-6 bg-success-50 border border-success-200 rounded-lg text-center"
        >
          <CheckCircle className="w-12 h-12 text-success-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-success-800 mb-2">
            Document(s) Uploaded Successfully!
          </h3>
          <p className="text-success-600">
            Your documents have been submitted for review. 
            You'll receive an email notification once the verification is complete.
          </p>
          <p className="text-sm text-success-500 mt-2">
            This process typically takes 1-2 business days.
          </p>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
        <h3 className="text-sm font-semibold text-primary-800 mb-2">
          Document Upload Guidelines
        </h3>
        <ul className="text-sm text-primary-700 space-y-1">
          <li>• Upload any documents you have available</li>
          <li>• Clear, readable photos or scans</li>
          <li>• File formats: PDF, JPG, PNG</li>
          <li>• Maximum file size: 5MB per file</li>
          <li>• Documents must be valid and not expired</li>
        </ul>
      </div>

      <div className="space-y-8">
        {/* Document Upload Sections */}
        {Object.entries(DOCUMENT_TYPES).map(([documentType, config]) => {
          const currentFile = documents[documentType];
          const isActive = dragActive[documentType];
          const isUploading = uploading[documentType];
          const progress = uploadProgress[documentType];
          const error = errors[documentType];
          const isSuccess = success[documentType];
          
          return (
            <div key={documentType} className="border border-secondary-200 rounded-lg p-6 space-y-4">
              {/* Document Type Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-semibold text-secondary-900">
                    {config.title}
                  </h4>
                  <span className="text-xs text-secondary-500 font-medium">Optional</span>
                </div>
                
                {isSuccess && (
                  <div className="flex items-center text-success-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-xs font-medium">Uploaded</span>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-secondary-600">
                {config.description}
              </p>

              {/* Error Message for this document */}
              {error && (
                <div className="mb-3">
                  <ErrorMessage message={error} />
                </div>
              )}

              {/* Upload Area */}
              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
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
                    <CheckCircle className={`w-8 h-8 mx-auto ${isSuccess ? 'text-success-600' : 'text-secondary-600'}`} />
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
                        size="xs"
                        onClick={() => previewFile(currentFile)}
                        className="flex items-center"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      
                      <Button
                        type="button"
                        variant="secondary"
                        size="xs"
                        onClick={() => config.ref.current?.click()}
                        disabled={isUploading}
                        className="flex items-center"
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Replace
                      </Button>
                      
                      <Button
                        type="button"
                        variant="secondary"
                        size="xs"
                        onClick={() => removeFile(documentType)}
                        disabled={isUploading}
                        className="flex items-center text-error-600 hover:text-error-700"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Empty State
                  <div className="space-y-3">
                    <Upload className="w-8 h-8 text-secondary-400 mx-auto" />
                    <div>
                      <p className="text-sm font-medium text-secondary-900">
                        Drop file here or click to browse
                      </p>
                      <p className="text-xs text-secondary-600">
                        PDF, JPG, PNG (max 5MB)
                      </p>
                    </div>
                    
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => config.ref.current?.click()}
                      disabled={isUploading}
                    >
                      Choose File
                    </Button>
                  </div>
                )}
              </div>

              {/* Upload Progress for this document */}
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
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
                    <span className="text-xs text-secondary-600">
                      Please wait...
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Individual Upload Button */}
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  loading={isUploading}
                  disabled={!currentFile || isSuccess}
                  onClick={() => handleDocumentUpload(documentType)}
                  className="min-w-[120px]"
                >
                  {isUploading ? 'Uploading...' : isSuccess ? 'Uploaded' : 'Upload Document'}
                </Button>
              </div>
            </div>
          );
        })}

      </div>
    </motion.div>
  );
};

export default KYCUpload;