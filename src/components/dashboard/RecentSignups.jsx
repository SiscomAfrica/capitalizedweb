import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  CheckCircle, 
  Clock, 
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import adminClient from '../../api/adminClient';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

/**
 * RecentSignups Component
 * Shows recent user signups and signup statistics for the dashboard
 */
const RecentSignups = ({ showFullList = false }) => {
  const [signups, setSignups] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load recent signups and stats
  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Load recent users (limit to 5 for dashboard, more for full list)
      const limit = showFullList ? 20 : 5;
      const [usersResponse, statsResponse] = await Promise.all([
        adminClient.getUsers({ 
          limit, 
          offset: 0,
          // Sort by newest first (API sorts by created_at desc by default)
        }),
        adminClient.getUserStats()
      ]);

      setSignups(usersResponse.users || []);
      setStats(statsResponse);

    } catch (err) {
      console.error('Error loading signup data:', err);
      
      // Handle authentication errors gracefully
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Admin access required to view signup data');
      } else {
        setError(err.response?.data?.detail || 'Failed to load signup data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [showFullList]);

  // Handle refresh
  const handleRefresh = () => {
    loadData(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  // Get user status badge
  const getUserStatusBadge = (user) => {
    if (user.phone_verified && user.profile_completed) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Ready
        </span>
      );
    } else if (user.phone_verified) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
          <Phone className="w-3 h-3 mr-1" />
          Phone Verified
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    }
  };

  if (loading && !signups.length) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <ErrorMessage message={error} onRetry={() => loadData()} />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {showFullList ? 'All Recent Signups' : 'Recent Signups'}
              </h3>
              <p className="text-sm text-gray-600">
                {showFullList 
                  ? `Latest ${signups.length} users who joined the platform`
                  : 'Latest users who joined the platform'
                }
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.total_users}</div>
              <div className="text-xs text-gray-600">Total Users</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.phone_verified}</div>
              <div className="text-xs text-gray-600">Phone Verified</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.profile_completed}</div>
              <div className="text-xs text-gray-600">Profile Complete</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.can_invest}</div>
              <div className="text-xs text-gray-600">Can Invest</div>
            </div>
          </div>
        )}
      </div>

      {/* Signups List */}
      <div className="divide-y divide-gray-200">
        {signups.length > 0 ? (
          signups.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{user.full_name}</h4>
                      {getUserStatusBadge(user)}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Signup Date */}
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="w-3 h-3" />
                    {formatDate(user.created_at)}
                  </div>
                  {user.country && (
                    <div className="text-xs text-gray-500 mt-1">
                      {user.city ? `${user.city}, ${user.country}` : user.country}
                    </div>
                  )}
                </div>
              </div>

              {/* Capabilities */}
              <div className="flex items-center gap-2 mt-3">
                {user.can_invest && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Can Invest
                  </span>
                )}
                {user.can_subscribe && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    <Users className="w-3 h-3 mr-1" />
                    Can Subscribe
                  </span>
                )}
                {user.kyc_status === 'approved' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    KYC Approved
                  </span>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No signups yet</h3>
            <p className="text-gray-600">
              New user signups will appear here when they join the platform.
            </p>
          </div>
        )}
      </div>

      {/* Footer for dashboard view */}
      {!showFullList && signups.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              // Navigate to full admin page
              window.location.href = '/admin';
            }}
          >
            View All Users
          </Button>
        </div>
      )}
    </Card>
  );
};

export default RecentSignups;