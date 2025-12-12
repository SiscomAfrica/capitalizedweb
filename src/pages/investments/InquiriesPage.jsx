import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FileText, Clock, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import InquiryList from '../../components/investments/InquiryList';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const InquiriesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState(null);

  // Handle success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      
      // Clear the message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

      // Clear navigation state
      navigate(location.pathname, { replace: true });

      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, location.pathname]);

  // Handle inquiry click


  // Handle create new inquiry
  const handleCreateInquiry = () => {
    navigate('/investments/products');
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-success-50 border border-success-200 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success-600" />
                <p className="text-sm text-success-700">{successMessage}</p>
              </div>
            </motion.div>
          )}

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">
                Investment Inquiries
              </h1>
              <p className="text-secondary-600 mt-1">
                Track your investment inquiries and payment status
              </p>
            </div>

            <Button
              variant="primary"
              onClick={handleCreateInquiry}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Inquiry
            </Button>
          </div>


          {/* Inquiries List */}
          <InquiryList onInquiryClick={handleInquiryClick} />
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default InquiriesPage;