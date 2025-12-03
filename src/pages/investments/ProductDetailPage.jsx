import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProductDetail from '../../components/investments/ProductDetail';
import InquiryForm from '../../components/investments/InquiryForm';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Modal from '../../components/common/Modal';

const ProductDetailPage = () => {
  const { productId: productSlug } = useParams(); // URL param is actually the slug
  const navigate = useNavigate();
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Handle back navigation
  const handleBack = () => {
    navigate('/investments/products');
  };

  // Handle create inquiry
  const handleCreateInquiry = (product) => {
    setSelectedProduct(product);
    setShowInquiryForm(true);
  };

  // Handle inquiry success
  const handleInquirySuccess = (inquiry) => {
    setShowInquiryForm(false);
    setSelectedProduct(null);
    
    // Navigate to inquiries page with success message
    navigate('/investments/inquiries', {
      state: {
        message: 'Investment inquiry created successfully!',
        inquiryId: inquiry.id
      }
    });
  };

  // Handle inquiry cancel
  const handleInquiryCancel = () => {
    setShowInquiryForm(false);
    setSelectedProduct(null);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ProductDetail
            productId={productSlug}
            onBack={handleBack}
            onCreateInquiry={handleCreateInquiry}
          />

          {/* Inquiry Form Modal */}
          <AnimatePresence>
            {showInquiryForm && selectedProduct && (
              <Modal
                isOpen={showInquiryForm}
                onClose={handleInquiryCancel}
                title="Create Investment Inquiry"
                className="max-w-2xl"
              >
                <InquiryForm
                  product={selectedProduct}
                  onSuccess={handleInquirySuccess}
                  onCancel={handleInquiryCancel}
                />
              </Modal>
            )}
          </AnimatePresence>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ProductDetailPage;