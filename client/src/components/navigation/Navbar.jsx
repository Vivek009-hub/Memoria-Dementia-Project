import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge } from '../common/Badge.jsx';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <Link to="/" className="flex items-center space-x-3">
        <Shield className="w-8 h-8 text-brand-500" />
        <span className="text-2xl font-extrabold text-white tracking-tight">Memora</span>
      </Link>

      {isAuthenticated ? (
        <div className="flex items-center space-x-4">
          <Link
            to={user?.role === 'PATIENT' ? '/app/profile' : '/app'}
            className="flex items-center space-x-2 bg-slate-950 hover:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-800 transition-colors cursor-pointer"
          >
            <User className="w-4 h-4 text-brand-400" />
            <span className="text-sm font-semibold text-slate-200">{user?.name || user?.email}</span>
            <Badge variant="brand">{user?.role}</Badge>
          </Link>
          <button
            onClick={logout}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-bold rounded-xl border border-slate-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-xl border border-slate-700"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-xl shadow-md"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
