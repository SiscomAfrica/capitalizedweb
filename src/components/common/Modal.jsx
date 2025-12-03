import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  ...props
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Size styles
  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeOnEscape, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement;
      
      // Focus the modal
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 100);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
      
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Focus trap implementation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
          />

          {/* Modal container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              ref={modalRef}
              className={`relative w-full ${sizeStyles[size]} bg-white rounded-lg shadow-large ${className}`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                duration: 0.2,
                ease: 'easeOut'
              }}
              onKeyDown={handleKeyDown}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
              {...props}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-4 border-b border-secondary-200">
                  {title && (
                    <h2 
                      id="modal-title"
                      className="text-lg font-semibold text-secondary-900"
                    >
                      {title}
                    </h2>
                  )}
                  
                  {showCloseButton && (
                    <button
                      type="button"
                      className="ml-auto inline-flex items-center justify-center w-8 h-8 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      onClick={onClose}
                      aria-label="Close modal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;