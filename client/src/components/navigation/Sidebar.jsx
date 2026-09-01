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
    <aside className="w-full md:w-64 lg:w-[280px] bg-[#1B1B1B] border-r border-[#343434] md:min-h-[calc(100vh-61px)] p-4 flex flex-col justify-between shrink-0">
      <nav className="space-y-1.5">
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
                    ? 'bg-[#242424] text-[#D8B24C] font-semibold border border-[#343434] shadow-xs'
                    : 'text-[#A7A7A2] hover:bg-[#202020] hover:text-[#F5F5F0]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#D8B24C] rounded-r-full" />
                  )}
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D8B24C]' : 'text-[#74746F]'}`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-4">
        {/* Supportive encouragement card */}
        <div className="p-4 bg-[#202020] border border-[#343434] rounded-xl space-y-1.5 hidden md:block">
          <div className="flex items-center space-x-2 text-[#D8B24C]">
            <Heart className="w-4 h-4 text-[#D8B24C] fill-[#D8B24C]/20" />
            <span className="text-xs font-semibold text-[#F5F5F0]">You're doing great!</span>
          </div>
          <p className="text-xs text-[#A7A7A2] leading-relaxed">
            Keep engaging daily to strengthen your memories.
          </p>
          <div className="w-6 h-0.5 bg-[#D8B24C]/40 rounded-full mt-2" />
        </div>

        <div className="pt-3 border-t border-[#343434] px-1 hidden md:block">
          <p className="text-xs text-[#74746F]">Memora &copy; 2026</p>
          <p className="text-[11px] text-[#74746F]">Cognitive Care System</p>
        </div>
      </div>
    </aside>
  );
}
