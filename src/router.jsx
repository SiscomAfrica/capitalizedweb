import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyPhonePage from './pages/auth/VerifyPhonePage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';

// Profile Pages
import ProfilePage from './pages/profile/ProfilePage';

// Investment Pages
import ProductsPage from './pages/investments/ProductsPage';
import ProductDetailPage from './pages/investments/ProductDetailPage';
import InquiriesPage from './pages/investments/InquiriesPage';

// Portfolio Pages
import PortfolioPage from './pages/portfolio/PortfolioPage';

// Subscription Pages
import PlansPage from './pages/subscriptions/PlansPage';
import MySubscriptionPage from './pages/subscriptions/MySubscriptionPage';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Page transition animation wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ 
      duration: 0.3,
      ease: [0.4, 0.0, 0.2, 1] // Custom easing for smooth transitions
    }}
  >
    {children}
  </motion.div>
);

// Wrapper for protected routes with transitions
const ProtectedPageTransition = ({ children, requireKYC = false }) => (
  <ProtectedRoute requireKYC={requireKYC}>
    <PageTransition>
      {children}
    </PageTransition>
  </ProtectedRoute>
);

// Wrapper for public routes with transitions
const PublicPageTransition = ({ children }) => (
  <PageTransition>
    {children}
  </PageTransition>
);

export const router = createBrowserRouter([
  // Root redirect to dashboard for authenticated users, login for unauthenticated
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },

  // Authentication Routes (Public)
  {
    path: '/login',
    element: (
      <PublicPageTransition>
        <LoginPage />
      </PublicPageTransition>
    )
  },
  {
    path: '/register',
    element: (
      <PublicPageTransition>
        <RegisterPage />
      </PublicPageTransition>
    )
  },
  {
    path: '/verify-phone',
    element: (
      <PublicPageTransition>
        <VerifyPhonePage />
      </PublicPageTransition>
    )
  },

  // Dashboard Routes (Protected)
  {
    path: '/dashboard',
    element: (
      <ProtectedPageTransition>
        <DashboardPage />
      </ProtectedPageTransition>
    )
  },

  // Profile Routes (Protected)
  {
    path: '/profile',
    element: (
      <ProtectedPageTransition>
        <ProfilePage />
      </ProtectedPageTransition>
    )
  },

  // Investment Routes (Protected)
  {
    path: '/investments',
    children: [
      {
        path: 'products',
        element: (
          <ProtectedPageTransition>
            <ProductsPage />
          </ProtectedPageTransition>
        )
      },
      {
        path: 'products/:productId',
        element: (
          <ProtectedPageTransition>
            <ProductDetailPage />
          </ProtectedPageTransition>
        )
      },
      {
        path: 'inquiries',
        element: (
          <ProtectedPageTransition requireKYC={true}>
            <InquiriesPage />
          </ProtectedPageTransition>
        )
      },
      // Redirect /investments to /investments/products
      {
        path: '',
        element: <Navigate to="products" replace />
      }
    ]
  },

  // Portfolio Routes (Protected - Requires KYC)
  {
    path: '/portfolio',
    element: (
      <ProtectedPageTransition requireKYC={true}>
        <PortfolioPage />
      </ProtectedPageTransition>
    )
  },

  // Subscription Routes (Protected)
  {
    path: '/subscriptions',
    children: [
      {
        path: 'plans',
        element: (
          <ProtectedPageTransition>
            <PlansPage />
          </ProtectedPageTransition>
        )
      },
      {
        path: 'my-subscription',
        element: (
          <ProtectedPageTransition>
            <MySubscriptionPage />
          </ProtectedPageTransition>
        )
      },
      // Redirect /subscriptions to /subscriptions/plans
      {
        path: '',
        element: <Navigate to="plans" replace />
      }
    ]
  },

  // Catch-all route - redirect to dashboard
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
]);

export default router;