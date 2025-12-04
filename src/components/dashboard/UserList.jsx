import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  Clock
} from 'lucide-react';

// Components
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

// API
import adminClient from '../../api/adminClient';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState({
    search: '',
    phoneVerified: '',
    profileCompleted: ''
  });

  // Fetch users
  const fetchUsers = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminClient.getUsers({
        limit: pagination.limit,
        offset: pagination.offset,
        ...filters,
        ...params
      });

      setUsers(response.users || []);
      setPagination({
        total: response.total || 0,
        limit: response.limit || 20,
        offset: response.offset || 0,
        hasNext: response.has_next || false,
        hasPrev: response.has_prev || false
      });
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle search
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, offset: 0 }));
    fetchUsers({ search: searchTerm, offset: 0 });
  };

  // Handle filter change
  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, offset: 0 }));
    fetchUsers({ ...newFilters, offset: 0 });
  };

  // Handle pagination
  const handlePageChange = (newOffset) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
    fetchUsers({ offset: newOffset });
  };



  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="bg-gray-100 rounded-2xl p-12 shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff]">
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 rounded-2xl p-12 shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff]">
        <div className="flex items-center justify-center">
          <ErrorMessage message={error} onRetry={() => fetchUsers()} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-100 rounded-2xl p-6 shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]">
              <Users className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Event Attendees
              </h1>
              <p className="text-sm text-gray-600">
                {pagination.total} people attending
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-100 rounded-2xl p-6 shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff]">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] border-0 focus:outline-none focus:shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] text-gray-700 placeholder-gray-500"
            />
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              value={filters.phoneVerified}
              onChange={(e) => handleFilterChange('phoneVerified', e.target.value)}
              className="px-4 py-3 bg-gray-100 rounded-xl shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] border-0 focus:outline-none focus:shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] text-gray-700"
            >
              <option value="">All Phone Status</option>
              <option value="true">Verified</option>
              <option value="false">Not Verified</option>
            </select>

            <select
              value={filters.profileCompleted}
              onChange={(e) => handleFilterChange('profileCompleted', e.target.value)}
              className="px-4 py-3 bg-gray-100 rounded-xl shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] border-0 focus:outline-none focus:shadow-[inset_6px_6px_12px_#d1d5db,inset_-6px_-6px_12px_#ffffff] text-gray-700"
            >
              <option value="">All Profile Status</option>
              <option value="true">Completed</option>
              <option value="false">Incomplete</option>
            </select>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-gray-100 rounded-2xl p-6 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]">
            {/* User Avatar & Basic Info */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]">
                <span className="text-gray-600 font-bold text-xl">
                  {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 truncate text-lg">
                  {user.full_name || 'Unknown User'}
                </h3>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <Phone className="h-3 w-3" />
                    <span>{user.phone}</span>
                    {user.phone_verified && (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-3">
              {/* Location */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">Location</span>
                </div>
                <span className="text-sm text-gray-800 font-medium">
                  {user.city && user.country ? `${user.city}, ${user.country}` : 'Not provided'}
                </span>
              </div>

              {/* Join Date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Joined</span>
                </div>
                <span className="text-sm text-gray-800 font-medium">
                  {formatDate(user.created_at)}
                </span>
              </div>

              {/* Last Login */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Last Login</span>
                </div>
                <span className="text-sm text-gray-800 font-medium">
                  {formatDate(user.last_login)}
                </span>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="mt-4 pt-4 border-t border-gray-300">
              <div className="flex flex-wrap gap-2 mb-2">
                {user.profile_completed && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium shadow-[inset_2px_2px_4px_#d1fae5,inset_-2px_-2px_4px_#ffffff]">
                    Profile Complete
                  </span>
                )}
                {user.can_invest && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium shadow-[inset_2px_2px_4px_#dbeafe,inset_-2px_-2px_4px_#ffffff]">
                    Can Invest
                  </span>
                )}
                {user.can_subscribe && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium shadow-[inset_2px_2px_4px_#e9d5ff,inset_-2px_-2px_4px_#ffffff]">
                    Can Subscribe
                  </span>
                )}
              </div>
              
              <div className="text-xs text-gray-500 font-mono">
                ID: {user.id.slice(0, 8)}...
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="bg-gray-100 rounded-2xl p-6 shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm text-gray-600 font-medium">
              Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} users
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePageChange(pagination.offset - pagination.limit)}
                disabled={!pagination.hasPrev || loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm ${
                  !pagination.hasPrev || loading
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              
              <button
                onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                disabled={!pagination.hasNext || loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm ${
                  !pagination.hasNext || loading
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]'
                }`}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay for pagination */}
      {loading && users.length > 0 && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-gray-100 rounded-2xl p-8 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]">
            <LoadingSpinner size="md" />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;