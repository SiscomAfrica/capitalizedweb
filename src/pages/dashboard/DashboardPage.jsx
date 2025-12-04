import React from 'react';

// Components
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import UserList from '../../components/dashboard/UserList';

const DashboardPage = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <UserList />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardPage;