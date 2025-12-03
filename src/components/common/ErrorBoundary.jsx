import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (or error tracking service in production)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Store error details in state
    this.setState({
      error,
      errorInfo,
    });

    // In production, you would send this to an error tracking service
    if (import.meta.env.PROD) {
      // Example: Send to error tracking service
      // errorTrackingService.captureException(error, {
      //   extra: errorInfo,
      //   tags: {
      //     component: 'ErrorBoundary',
      //   },
      // });
    }
  }

  handleRetry = () => {
    // Reset error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    // Navigate to home page
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      const { fallback: CustomFallback } = this.props;
      
      if (CustomFallback) {
        return (
          <CustomFallback
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            onGoHome={this.handleGoHome}
          />
        );
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <motion.div
            className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-error-600" />
              </div>
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page or go back to the home page.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full"
                variant="primary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                className="w-full"
                variant="secondary"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Home
              </Button>
            </div>
            
            {/* Show error details in development */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </motion.div>
        </div>
      );
    }

    // Render children normally if no error
    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (Component, fallback) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook for error boundary (for functional components)
export const useErrorHandler = () => {
  return (error, errorInfo) => {
    // Log error
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // In production, send to error tracking service
    if (import.meta.env.PROD) {
      // Example: Send to error tracking service
      // errorTrackingService.captureException(error, {
      //   extra: errorInfo,
      //   tags: {
      //     component: 'useErrorHandler',
      //   },
      // });
    }
  };
};

export default ErrorBoundary;