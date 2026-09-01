import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge } from '../common/Badge.jsx';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-[#1B1B1B] border-b border-[#343434] px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
      <Link to="/" className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#DDBB55]/10 border border-[#DDBB55]/30 flex items-center justify-center">
          <Shield className="w-4 h-4 text-[#DDBB55]" />
        </div>
        <span className="text-xl font-semibold text-[#E8E8E8] tracking-wider uppercase font-sans">
          MEMORA
        </span>
      </Link>

      {isAuthenticated ? (
        <div className="flex items-center space-x-3">
          <Link
            to={user?.role === 'PATIENT' ? '/app/profile' : '/app'}
            className="flex items-center space-x-2.5 bg-[#252525] hover:bg-[#2A2A2A] px-3.5 py-1.5 rounded-lg border border-[#343434] transition-colors"
          >
            <User className="w-4 h-4 text-[#DDBB55]" />
            <span className="text-sm font-medium text-[#E8E8E8]">{user?.name || user?.email}</span>
            <Badge variant="brand">{user?.role}</Badge>
          </Link>
          <button
            onClick={logout}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-transparent hover:bg-[#252525] text-[#A0A0A0] hover:text-[#E8E8E8] text-sm font-medium rounded-lg border border-[#343434] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="px-4 py-2 bg-transparent hover:bg-[#252525] text-[#E8E8E8] text-sm font-medium rounded-lg border border-[#343434] transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-[#DDBB55] hover:bg-[#E8C968] text-[#1E1E1E] text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}

