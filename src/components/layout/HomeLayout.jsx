import React from 'react';
import HomeNavigation from './HomeNavigation';

export default function HomeLayout({ children }) {
  return (
    <div className="min-h-screen bg-purple-900">
      <HomeNavigation />
      <main>
        {children}
      </main>
    </div>
  );
}