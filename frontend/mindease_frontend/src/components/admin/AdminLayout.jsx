// src/components/Admin/AdminLayout.jsx
import React from 'react';
import AdminNotification from './AdminNotifications';


const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex justify-end items-center p-4 bg-white shadow">
        <AdminNotification/>
      </header>
      <main className="p-4">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
