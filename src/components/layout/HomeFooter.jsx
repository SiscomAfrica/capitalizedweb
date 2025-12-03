import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function HomeFooter() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <footer className="bg-purple-900 border-t border-yellow-400/20 py-16">
      <div className="max-w-7xl mx-auto px-8 lg:px-12">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-300 rounded flex items-center justify-center">
                <span className="text-purple-900 text-lg font-bold">A</span>
              </div>
              <span className="text-white text-xl font-bold">AFRICA INVEST</span>
            </div>
            <p className="text-white/70 text-lg mb-6 max-w-md">
              Connecting investors with Africa's most promising tech infrastructure and startup opportunities.
            </p>
            <div className="flex gap-4">
              {isAuthenticated ? (
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-300 transition-all font-semibold"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/register')}
                    className="px-6 py-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-300 transition-all font-semibold"
                  >
                    Get Started
                  </button>
                  <button 
                    onClick={() => navigate('/login')}
                    className="px-6 py-3 bg-transparent border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all"
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Platform</h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => navigate('/investments')}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Browse Investments
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/register')}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Start Investing
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/register')}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Raise Capital
                </button>
              </li>
              <li>
                <button className="text-white/70 hover:text-white transition-colors">
                  How It Works
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <button className="text-white/70 hover:text-white transition-colors">
                  Help Center
                </button>
              </li>
              <li>
                <button className="text-white/70 hover:text-white transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <button className="text-white/70 hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button className="text-white/70 hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            © 2024 Africa Investment Platform. All rights reserved.
          </p>
          <div className="flex gap-6">
            <button className="text-white/60 hover:text-white transition-colors text-sm">
              Privacy
            </button>
            <button className="text-white/60 hover:text-white transition-colors text-sm">
              Terms
            </button>
            <button className="text-white/60 hover:text-white transition-colors text-sm">
              Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}