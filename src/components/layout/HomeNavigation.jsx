import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function HomeNavigation() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated, user, getUserName, getUserInitials, logout } = useAuth();
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const categories = [
    'Data Center Funds',
    'Hardware Nodes',
    'VM Pools',
    'Investment Notes',
    'Venture Funding'
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleUserMenuClick = (action) => {
    setUserMenuOpen(false);
    if (action === 'dashboard') {
      navigate('/dashboard');
    } else if (action === 'profile') {
      navigate('/profile');
    } else if (action === 'logout') {
      handleLogout();
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-purple-900 border-b border-yellow-400/20 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-300 rounded flex items-center justify-center">
              <span className="text-purple-900 text-lg font-bold">C</span>
            </div>
            <span className="text-white text-xl font-bold">Capitalized</span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => navigate('/')}
              className="text-base text-white/80 hover:text-white transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => navigate('/investments')}
              className="text-base text-white/80 hover:text-white transition-colors"
            >
              Investments
            </button>
            <div className="relative group">
              <button className="text-base text-white/80 hover:text-white transition-colors">
                Categories
              </button>
              <div className="absolute top-full left-0 mt-3 w-72 bg-purple-800 border border-yellow-400/30 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => navigate('/investments')}
                    className="block w-full text-left px-6 py-4 text-base text-white/80 hover:text-white hover:bg-yellow-400/10 transition-colors first:rounded-t-xl last:rounded-b-xl"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Authentication Section */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-purple-900 text-sm font-semibold">
                      {getUserInitials()}
                    </span>
                  </div>
                  <span className="text-white text-sm font-medium">
                    {getUserName() || 'User'}
                  </span>
                </button>
                
                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-purple-800 border border-yellow-400/30 rounded-xl shadow-2xl z-50">
                    <button
                      onClick={() => handleUserMenuClick('dashboard')}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left text-white/80 hover:text-white hover:bg-yellow-400/10 transition-colors first:rounded-t-xl"
                    >
                      <User className="w-4 h-4" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => handleUserMenuClick('profile')}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left text-white/80 hover:text-white hover:bg-yellow-400/10 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => handleUserMenuClick('logout')}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left text-white/80 hover:text-white hover:bg-yellow-400/10 transition-colors last:rounded-b-xl"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="text-base text-white/80 hover:text-white transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-8 py-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-300 transition-all shadow-md hover:shadow-lg text-base font-semibold"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-yellow-400/20">
            <button 
              onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-4 py-3 text-white/80 hover:text-white"
            >
              Home
            </button>
            <button 
              onClick={() => { navigate('/investments'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-4 py-3 text-white/80 hover:text-white"
            >
              Investments
            </button>
            <div className="px-4 py-2 text-yellow-400 text-sm">Categories</div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { navigate('/investments'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-6 py-2 text-white/70 hover:text-white text-sm"
              >
                {cat}
              </button>
            ))}
            
            {/* Mobile Authentication Section */}
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2 border-t border-yellow-400/20 mt-2">
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-purple-900 text-sm font-semibold">
                        {getUserInitials()}
                      </span>
                    </div>
                    <span className="text-white text-sm font-medium">
                      {getUserName() || 'User'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-white/80 hover:text-white"
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </button>
                <button 
                  onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-white/80 hover:text-white"
                >
                  <Settings className="w-4 h-4" />
                  Profile
                </button>
                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-white/80 hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-4 py-3 text-white/80 hover:text-white"
                >
                  Login
                </button>
                <button 
                  onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                  className="mx-4 mt-4 w-[calc(100%-2rem)] px-6 py-3 bg-yellow-400 text-purple-900 rounded-lg font-semibold"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}