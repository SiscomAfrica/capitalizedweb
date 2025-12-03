import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  ChevronDown,
  Home,
  TrendingUp,
  Briefcase,
  CreditCard
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Button from '../common/Button';

const Header = ({ onMenuToggle }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, getUserName, getUserInitials } = useAuth();
  const location = useLocation();

  // Navigation links
  const navigationLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Investments', href: '/investments', icon: TrendingUp },
    { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
    { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  ];

  // Check if current path is active
  const isActiveLink = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsUserMenuOpen(false);
    // Also trigger sidebar toggle if provided
    if (onMenuToggle) {
      onMenuToggle();
    }
  };

  // Toggle user menu
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Close menus when clicking outside
  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-secondary-200 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              to={isAuthenticated ? "/dashboard" : "/"} 
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SA</span>
              </div>
              <span className="font-bold text-xl hidden sm:block">SISCOM Africa</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex space-x-8">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                const isActive = isActiveLink(link.href);
                
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-secondary-700 hover:text-primary-600 hover:bg-secondary-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {getUserInitials()}
                  </div>
                  <span className="max-w-32 truncate">{getUserName()}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={closeMenus}
                      />
                      
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-large border border-secondary-200 py-1 z-20"
                      >
                        <Link
                          to="/profile"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 transition-colors"
                          onClick={closeMenus}
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                        
                        <hr className="my-1 border-secondary-200" />
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign out</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/20 z-10 md:hidden" 
              onClick={closeMenus}
            />
            
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white border-b border-secondary-200 shadow-medium z-20 relative"
            >
              <div className="px-4 py-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    {/* User Info */}
                    <div className="flex items-center space-x-3 px-3 py-3 bg-secondary-50 rounded-md mb-4">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                        {getUserInitials()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-secondary-900 truncate">
                          {getUserName()}
                        </p>
                        <p className="text-xs text-secondary-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    {navigationLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = isActiveLink(link.href);
                      
                      return (
                        <Link
                          key={link.name}
                          to={link.href}
                          onClick={closeMenus}
                          className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                            isActive
                              ? 'text-primary-600 bg-primary-50'
                              : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{link.name}</span>
                        </Link>
                      );
                    })}

                    <hr className="my-3 border-secondary-200" />

                    {/* Profile Link */}
                    <Link
                      to="/profile"
                      onClick={closeMenus}
                      className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span>Profile</span>
                    </Link>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-3 py-3 rounded-md text-base font-medium text-error-600 hover:bg-error-50 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign out</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Link to="/login" onClick={closeMenus}>
                      <Button variant="secondary" size="md" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register" onClick={closeMenus}>
                      <Button variant="primary" size="md" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;