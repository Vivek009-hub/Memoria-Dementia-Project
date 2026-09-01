import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar.jsx';
import { Sidebar } from '../components/navigation/Sidebar.jsx';

export function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#1E1E1E] text-[#E8E8E8]">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

