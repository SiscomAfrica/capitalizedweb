import React, { useState } from 'react';
import ErrorModal from './ErrorModal';

const ErrorModalDemo = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  const showErrorModal = (config) => {
    setModalConfig(config);
    setShowModal(true);
  };

  const demoErrors = [
    {
      title: 'Invalid Credentials',
      message: 'The email or password you entered is incorrect. Please check your credentials and try again.',
      type: 'error',
      actionButton: (
        <button className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 sm:w-auto transition-colors">
          Reset Password
        </button>
      )
    },
    {
      title: 'Account Not Found',
      message: 'No account found with this email address. Would you like to create a new account?',
      type: 'warning',
      actionButton: (
        <button className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 sm:w-auto transition-colors">
          Create Account
        </button>
      )
    },
    {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      type: 'warning'
    },
    {
      title: 'Server Error',
      message: 'Something went wrong on our end. Our team has been notified and is working to fix the issue.',
      type: 'error'
    },
    {
      title: 'Information',
      message: 'Your session will expire in 5 minutes. Please save your work.',
      type: 'info'
    }
  ];

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-secondary-900 mb-6">Error Modal Demo</h2>
      
      <div className="grid gap-4">
        {demoErrors.map((error, index) => (
          <button
            key={index}
            onClick={() => showErrorModal(error)}
            className="p-4 text-left border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
          >
            <div className="font-medium text-secondary-900">{error.title}</div>
            <div className="text-sm text-secondary-600 mt-1">{error.message}</div>
            <div className="text-xs text-secondary-500 mt-2 capitalize">Type: {error.type}</div>
          </button>
        ))}
      </div>

      <ErrorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        actionButton={modalConfig.actionButton}
      />
    </div>
  );
};

export default ErrorModalDemo;