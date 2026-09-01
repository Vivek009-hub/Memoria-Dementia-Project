import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar.jsx';
import { Sidebar } from '../components/navigation/Sidebar.jsx';

export function PatientLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#151515] text-[#F5F5F0]">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

