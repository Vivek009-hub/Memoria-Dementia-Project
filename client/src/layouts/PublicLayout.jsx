import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar.jsx';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-slate-900/50 border-t border-slate-800/80 py-6 text-center text-sm text-slate-500">
        Memora © {new Date().getFullYear()} — AI Cognitive Care & Safety Platform
      </footer>
    </div>
  );
}
