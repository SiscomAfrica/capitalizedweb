import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import UserManagement from '../../components/admin/UserManagement';

/**
 * AdminPage
 * Main admin dashboard page with user management
 */
const AdminPage = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <UserManagement />
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;