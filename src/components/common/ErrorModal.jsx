import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ErrorModal = ({ 
  isOpen, 
  onClose, 
  title = "Error", 
  message, 
  actionButton = null,
  type = "error" // "error", "warning", "info"
}) => {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'warning':
        return {
          icon: (
            <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          bgColor: 'bg-warning-50',
          borderColor: 'border-warning-200',
          iconBg: 'bg-warning-100'
        };
      case 'info':
        return {
          icon: (
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-primary-50',
          borderColor: 'border-primary-200',
          iconBg: 'bg-primary-100'
        };
      default: // error
        return {
          icon: (
            <svg className="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-error-50',
          borderColor: 'border-error-200',
          iconBg: 'bg-error-100'
        };
    }
  };

  const { icon, bgColor, borderColor, iconBg } = getIconAndColors();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`relative transform overflow-hidden rounded-lg ${bgColor} border ${borderColor} px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:flex sm:items-start">
              {/* Icon */}
              <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                {icon}
              </div>
              
              {/* Content */}
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                <h3 className="text-lg font-semibold leading-6 text-secondary-900">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-secondary-600 leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:gap-3">
              {actionButton && (
                <div className="mb-3 sm:mb-0">
                  {actionButton}
                </div>
              )}
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-secondary-900 shadow-sm ring-1 ring-inset ring-secondary-300 hover:bg-secondary-50 sm:w-auto transition-colors"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ErrorModal;