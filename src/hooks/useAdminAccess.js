import { useState, useEffect } from 'react';
import adminClient from '../api/adminClient';

/**
 * Hook to check if the current user has admin access
 * This is determined by trying to access admin endpoints
 */
const useAdminAccess = () => {
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Only check once per session
      if (checked) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Try to access admin stats endpoint with minimal data
        await adminClient.getUserStats();
        
        // If successful, user has admin access
        setHasAdminAccess(true);
        
      } catch (error) {
        // If 401/403, user doesn't have admin access
        // If other error, assume no access for security
        setHasAdminAccess(false);
        
        // Don't log 401/403 errors as they're expected for non-admin users
        if (error.response?.status !== 401 && error.response?.status !== 403) {
          console.error('Error checking admin access:', error);
        }
      } finally {
        setLoading(false);
        setChecked(true);
      }
    };

    checkAdminAccess();
  }, [checked]);

  return {
    hasAdminAccess,
    isAdmin: hasAdminAccess,
    loading,
    checked
  };
};

export default useAdminAccess;