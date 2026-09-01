import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Gamepad2,
  Heart,
  Bell,
  Users,
  Video,
  Bot,
  Activity,
  ShieldAlert,
  BarChart3,
  Home,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export function Sidebar() {
  const { role } = useAuth();

  const patientNav = [
    { label: 'Overview', path: '/app', icon: Home },
    { label: 'Profile', path: '/app/profile', icon: User },
    { label: 'Memories', path: '/app/memories', icon: Heart },
    { label: 'Conversations', path: '/app/assistant', icon: Bot },
    { label: 'Reminders', path: '/app/reminders', icon: Bell },
    { label: 'Safety & SOS', path: '/app/safety', icon: ShieldAlert },
    { label: 'Games', path: '/app/games', icon: Gamepad2 },
    { label: 'Community', path: '/app/community', icon: Users },
    { label: 'Meeting Circle', path: '/app/meetings', icon: Video },
  ];

  const caregiverNav = [
    { label: 'Dashboard', path: '/app', icon: Home },
    { label: 'Reminders', path: '/app/reminders', icon: Bell },
    { label: 'Memories', path: '/app/memories', icon: Heart },
    { label: 'Cognitive Analytics', path: '/app/analytics', icon: BarChart3 },
    { label: 'Safety & Location', path: '/app/safety', icon: Activity },
    { label: 'Notifications', path: '/app/notifications', icon: Bell },
  ];

  const adminNav = [
    { label: 'Admin Overview', path: '/app', icon: Home },
    { label: 'Platform Analytics', path: '/app/analytics', icon: BarChart3 },
    { label: 'Community Proposals', path: '/app/community', icon: Users },
    { label: 'Notifications System', path: '/app/notifications', icon: Bell },
  ];

  const navItems = role === 'ADMIN' ? adminNav : role === 'CAREGIVER' ? caregiverNav : patientNav;

  return (
    <aside className="w-64 bg-[#1B1B1B] border-r border-[#343434] min-h-[calc(100vh-61px)] p-4 flex flex-col justify-between">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                  isActive
                    ? 'bg-[#252525] text-[#DDBB55] font-semibold border border-[#343434]'
                    : 'text-[#A0A0A0] hover:bg-[#252525]/60 hover:text-[#E8E8E8]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-[#DDBB55] rounded-r-full" />
                  )}
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#DDBB55]' : 'text-[#747474]'}`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="pt-4 border-t border-[#343434] px-3.5">
        <p className="text-xs text-[#747474]">Memora &copy; 2026</p>
        <p className="text-[11px] text-[#555555]">Cognitive Care System</p>
      </div>
    </aside>
  );
}

