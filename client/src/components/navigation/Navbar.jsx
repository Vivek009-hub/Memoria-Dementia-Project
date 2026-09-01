import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, LogOut, User, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge } from '../common/Badge.jsx';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-[#1B1B1B] border-b border-[#343434] px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      <Link to="/" className="flex items-center space-x-2.5 group">
        <div className="w-8 h-8 rounded-lg bg-[#D8B24C]/10 border border-[#D8B24C]/30 flex items-center justify-center transition-colors group-hover:border-[#D8B24C]/60">
          <Shield className="w-4 h-4 text-[#D8B24C]" />
        </div>
        <span className="text-xl font-semibold text-[#F5F5F0] tracking-wider uppercase font-sans">
          MEMORA
        </span>
      </Link>

      {isAuthenticated ? (
        <div className="flex items-center space-x-3">
          <Link
            to="/app/notifications"
            className="p-2 bg-[#202020] hover:bg-[#242424] text-[#A7A7A2] hover:text-[#F5F5F0] rounded-lg border border-[#343434] transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </Link>
          <Link
            to={user?.role === 'PATIENT' ? '/app/profile' : '/app'}
            className="flex items-center space-x-2.5 bg-[#202020] hover:bg-[#242424] px-3.5 py-1.5 rounded-lg border border-[#343434] transition-colors"
          >
            <User className="w-4 h-4 text-[#D8B24C]" />
            <span className="text-sm font-medium text-[#F5F5F0]">{user?.name || user?.email}</span>
            <Badge variant="brand">{user?.role || 'PATIENT'}</Badge>
          </Link>
          <button
            onClick={logout}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-transparent hover:bg-[#202020] text-[#A7A7A2] hover:text-[#F5F5F0] text-sm font-medium rounded-lg border border-[#343434] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="px-4 py-2 bg-transparent hover:bg-[#202020] text-[#F5F5F0] text-sm font-medium rounded-lg border border-[#343434] transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-[#D8B24C] hover:bg-[#F0C75E] text-[#151515] text-sm font-semibold rounded-lg transition-colors shadow-xs"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
