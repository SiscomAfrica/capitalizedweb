import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyPhonePage from './pages/auth/VerifyPhonePage';

// Home Page
import HomePage from './pages/HomePage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';

// Profile Pages
import ProfilePage from './pages/profile/ProfilePage';

// Onboarding Pages
import ProfileCompletionPage from './pages/onboarding/ProfileCompletionPage';
import KYCOnboardingPage from './pages/onboarding/KYCOnboardingPage';
import StreamlinedOnboardingPage from './pages/onboarding/StreamlinedOnboardingPage';

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
import OnboardingGuard from './components/auth/OnboardingGuard';

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
const ProtectedPageTransition = ({ children, requireSubscription = false }) => (
  <ProtectedRoute>
    <OnboardingGuard requireSubscription={requireSubscription}>
      <PageTransition>
        {children}
      </PageTransition>
    </OnboardingGuard>
  </ProtectedRoute>
);

// Wrapper for public routes with transitions
const PublicPageTransition = ({ children }) => (
  <PageTransition>
    {children}
  </PageTransition>
);

export const router = createBrowserRouter([
  // Homepage (Public)
  {
    path: '/',
    element: (
      <PublicPageTransition>
        <HomePage />
      </PublicPageTransition>
    )
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

  // Onboarding Routes (Protected but allow incomplete onboarding)
  {
    path: '/onboarding',
    children: [
      {
        path: 'streamlined',
        element: (
          <ProtectedRoute>
            <PageTransition>
              <StreamlinedOnboardingPage />
            </PageTransition>
          </ProtectedRoute>
        )
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <PageTransition>
              <ProfileCompletionPage />
            </PageTransition>
          </ProtectedRoute>
        )
      },
      {
        path: 'kyc',
        element: (
          <ProtectedRoute>
            <PageTransition>
              <KYCOnboardingPage />
            </PageTransition>
          </ProtectedRoute>
        )
      },
      // Redirect /onboarding to /onboarding/streamlined (new default)
      {
        path: '',
        element: <Navigate to="streamlined" replace />
      }
    ]
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
          <ProtectedPageTransition>
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

  // Portfolio Routes (Protected - Requires Subscription)
  {
    path: '/portfolio',
    element: (
      <ProtectedPageTransition requireSubscription={true}>
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

  // Direct subscription routes for backward compatibility
  {
    path: '/plans',
    element: <Navigate to="/subscriptions/plans" replace />
  },
  {
    path: '/my-subscription',
    element: <Navigate to="/subscriptions/my-subscription" replace />
  },

  // Catch-all route - redirect to dashboard
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
]);

export default router;