import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  X,
  Home,
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  CreditCard,
  User,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout, getUserName, getUserInitials, isKYCApproved, getKYCStatus } = useAuth();

  // Navigation links
  const navigationLinks = [
    { 
      name: 'Public Home', 
      href: '/', 
      icon: Home,
      description: 'Return to homepage'
    },
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      description: 'Overview and quick actions'
    },
    { 
      name: 'Investments', 
      href: '/investments', 
      icon: TrendingUp,
      description: 'Browse investment products'
    },
    { 
      name: 'Portfolio', 
      href: '/portfolio', 
      icon: Briefcase,
      description: 'Track your investments',
      requiresKYC: true
    },
    { 
      name: 'Subscriptions', 
      href: '/subscriptions', 
      icon: CreditCard,
      description: 'Manage your plans'
    },
  ];

  // Secondary links
  const secondaryLinks = [
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: User,
      description: 'Account settings'
    },
   
  
  ];

  // Check if current path is active
  const isActiveLink = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Handle link click
  const handleLinkClick = () => {
    // Close sidebar on mobile when link is clicked
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  // Sidebar content
  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-0 border-b border-secondary-200">
       
        
        {/* Close button (mobile only) */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>


      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {/* Primary Navigation */}
        <div className="space-y-1">
          {navigationLinks.map((link) => {
            const Icon = link.icon;
            const isActive = isActiveLink(link.href);
            const isDisabled = link.requiresKYC && !isKYCApproved();
            
            return (
              <div key={link.name} className="relative">
                <Link
                  to={isDisabled ? '#' : link.href}
                  onClick={isDisabled ? (e) => e.preventDefault() : handleLinkClick}
                  className={`group flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : isDisabled
                      ? 'text-secondary-400 cursor-not-allowed'
                      : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50'
                  }`}
                  title={isDisabled ? 'KYC approval required' : link.description}
                >
                  <Icon className={`w-5 h-5 mr-3 ${
                    isActive 
                      ? 'text-primary-600' 
                      : isDisabled 
                      ? 'text-secondary-400'
                      : 'text-secondary-500 group-hover:text-primary-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>{link.name}</span>
                      {isDisabled && (
                        <span className="text-xs bg-warning-100 text-warning-700 px-1.5 py-0.5 rounded">
                          KYC
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-secondary-500 mt-0.5 group-hover:text-secondary-600">
                      {link.description}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="py-4">
          <hr className="border-secondary-200" />
        </div>

        {/* Secondary Navigation */}
        <div className="space-y-1">
          {secondaryLinks.map((link) => {
            const Icon = link.icon;
            const isActive = isActiveLink(link.href);
            
            return (
              <Link
                key={link.name}
                to={link.href}
                onClick={handleLinkClick}
                className={`group flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${
                  isActive 
                    ? 'text-primary-600' 
                    : 'text-secondary-500 group-hover:text-primary-500'
                }`} />
                <div>
                  <div>{link.name}</div>
                  <p className="text-xs text-secondary-500 group-hover:text-secondary-600">
                    {link.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-secondary-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-3 rounded-lg text-sm font-medium text-error-600 hover:bg-error-50 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-80">
          <div className="flex flex-col flex-grow border-r border-secondary-200 bg-white overflow-hidden">
            {sidebarContent}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onClose}
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 30,
                duration: 0.3 
              }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] lg:hidden"
            >
              <div className="flex flex-col h-full shadow-large">
                {sidebarContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;