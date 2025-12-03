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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Accepted file types
  const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const MAX_FILES = 5;

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

  // Handle file selection
  const handleFileSelect = useCallback((files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const fileErrors = [];

    // Check total number of files
    if (selectedFiles.length + fileArray.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed. Please remove some files first.`);
      return;
    }

    fileArray.forEach((file) => {
      const errors = validateFile(file);
      
      if (errors.length === 0) {
        // Check for duplicates
        const isDuplicate = selectedFiles.some(
          existingFile => existingFile.name === file.name && existingFile.size === file.size
        );
        
        if (!isDuplicate) {
          validFiles.push({
            file,
            id: Math.random().toString(36).substr(2, 9),
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
          });
        } else {
          fileErrors.push(`File "${file.name}" is already selected.`);
        }
      } else {
        fileErrors.push(`${file.name}: ${errors.join(' ')}`);
      }
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setError(null);
    }

    if (fileErrors.length > 0) {
      setError(fileErrors.join('\n'));
    }
  }, [selectedFiles, validateFile]);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files);
    }
  };

  // Remove file
  const removeFile = (fileId) => {
    setSelectedFiles(prev => {
      const updatedFiles = prev.filter(f => f.id !== fileId);
      
      // Revoke object URL to prevent memory leaks
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      
      return updatedFiles;
    });
    
    setError(null);
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      setError('Please select at least one document to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(false);

    try {
      // Prepare files for upload
      const filesToUpload = selectedFiles.map(f => f.file);

      // Simulate progress (since we don't have real progress from the API)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      // Upload files
      const response = await authClient.submitKYC(filesToUpload);

      // Clear progress interval
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Update user context with new KYC status
      updateUser({ kycStatus: 'pending' });

      // Show success
      setSuccess(true);

      // Clean up file previews
      selectedFiles.forEach(fileData => {
        if (fileData.preview) {
          URL.revokeObjectURL(fileData.preview);
        }
      });

      // Call success callback after a delay
      setTimeout(() => {
        onSuccess?.(response);
      }, 2000);

    } catch (err) {
      console.error('KYC upload failed:', err);
      
      // Handle different types of errors
      if (err.response?.status === 400) {
        setError(err.response.data?.message || 'Invalid files. Please check your documents and try again.');
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.response?.status === 413) {
        setError('Files too large. Please reduce file sizes and try again.');
      } else {
        setError(err.message || 'Upload failed. Please try again.');
      }
      
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      selectedFiles.forEach(fileData => {
        if (fileData.preview) {
          URL.revokeObjectURL(fileData.preview);
        }
      });
    };
  }, [selectedFiles]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-6 bg-success-50 border border-success-200 rounded-lg text-center"
        >
          <CheckCircle className="w-12 h-12 text-success-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-success-800 mb-2">
            Documents Uploaded Successfully!
          </h3>
          <p className="text-success-600">
            Your identity documents have been submitted for review. 
            You'll receive an email notification once the verification is complete.
          </p>
          <p className="text-sm text-success-500 mt-2">
            This process typically takes 1-2 business days.
          </p>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Instructions */}
      <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
        <h3 className="text-sm font-semibold text-primary-800 mb-2">
          Required Documents
        </h3>
        <ul className="text-sm text-primary-700 space-y-1">
          <li>• Government-issued ID (National ID, Passport, or Driver's License)</li>
          <li>• Clear, readable photos or scans</li>
          <li>• File formats: PDF, JPG, PNG</li>
          <li>• Maximum file size: 5MB per file</li>
          <li>• Maximum {MAX_FILES} files total</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Drop Zone */}
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
            ${dragActive 
              ? 'border-primary-400 bg-primary-50' 
              : 'border-secondary-300 hover:border-secondary-400'
            }
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          
          <Upload className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            Drop files here or click to browse
          </h3>
          <p className="text-secondary-600 mb-4">
            Upload your identity documents (PDF, JPG, PNG)
          </p>
          
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            Choose Files
          </Button>
        </div>

        {/* Selected Files */}
        <AnimatePresence>
          {selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <h4 className="text-sm font-medium text-secondary-900">
                Selected Files ({selectedFiles.length}/{MAX_FILES})
              </h4>
              
              {selectedFiles.map((fileData) => {
                const FileIcon = getFileIcon(fileData.file);
                
                return (
                  <motion.div
                    key={fileData.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center p-3 bg-secondary-50 rounded-lg border"
                  >
                    <FileIcon className="w-8 h-8 text-secondary-600 mr-3 flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900 truncate">
                        {fileData.file.name}
                      </p>
                      <p className="text-xs text-secondary-600">
                        {formatFileSize(fileData.file.size)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-3">
                      {/* Preview Button */}
                      <button
                        type="button"
                        onClick={() => previewFile(fileData)}
                        className="p-1 text-secondary-400 hover:text-secondary-600 transition-colors"
                        title="Preview file"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFile(fileData.id)}
                        className="p-1 text-error-400 hover:text-error-600 transition-colors"
                        disabled={uploading}
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Progress */}
        {uploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary-700">Uploading documents...</span>
              <span className="text-secondary-600">{Math.round(uploadProgress)}%</span>
            </div>
            
            <div className="w-full bg-secondary-200 rounded-full h-2">
              <motion.div
                className="bg-primary-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size="sm" className="mr-2" />
              <span className="text-sm text-secondary-600">
                Please wait while we upload your documents...
              </span>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            loading={uploading}
            disabled={selectedFiles.length === 0 || success}
            className="min-w-[140px]"
          >
            {uploading ? 'Uploading...' : 'Submit Documents'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default KYCUpload;