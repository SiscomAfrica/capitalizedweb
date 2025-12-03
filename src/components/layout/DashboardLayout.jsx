import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children, className = '' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      
      // Auto-close sidebar on mobile when screen size changes
      if (mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    // Check initial screen size
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isSidebarOpen]);

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle sidebar close
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Handle escape key to close sidebar on mobile
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isSidebarOpen && isMobile) {
        closeSidebar();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isSidebarOpen, isMobile]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isSidebarOpen]);

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col">
      {/* Header */}
      <Header onMenuToggle={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex flex-1 pt-16"> {/* pt-16 to account for fixed header */}
        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={closeSidebar}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Content Area */}
          <div className="flex-1 relative">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`h-full ${className}`}
            >
              {/* Content Container */}
              <div className="h-full px-4 sm:px-6 lg:px-8 py-6">
                {children}
              </div>
            </motion.div>
          </div>

        </main>
      </div>

      {/* Mobile Sidebar Toggle Button (Floating Action Button) */}
      {isMobile && !isSidebarOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className="fixed bottom-6 left-6 z-30 w-14 h-14 bg-primary-600 text-white rounded-full shadow-large hover:bg-primary-700 transition-colors flex items-center justify-center lg:hidden"
          aria-label="Open navigation menu"
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 6h16M4 12h16M4 18h16" 
            />
          </svg>
        </motion.button>
      )}
    </div>
  );
};

export default DashboardLayout;