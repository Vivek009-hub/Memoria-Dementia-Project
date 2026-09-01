import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar.jsx';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#1E1E1E] text-[#E8E8E8]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-[#1B1B1B] border-t border-[#343434] py-6 text-center text-xs text-[#747474]">
        Memora &copy; {new Date().getFullYear()} &mdash; AI Cognitive Care & Safety Platform
      </footer>
    </div>
  );
}

