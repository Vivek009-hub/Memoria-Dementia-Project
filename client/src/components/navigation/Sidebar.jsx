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
    { label: 'Games', path: '/app/games', icon: Gamepad2 },
    { label: 'Memories', path: '/app/memories', icon: Heart },
    { label: 'Reminders', path: '/app/reminders', icon: Bell },
    { label: 'Community', path: '/app/community', icon: Users },
    { label: 'Meeting Circle', path: '/app/meetings', icon: Video },
    { label: 'AI Assistant', path: '/app/assistant', icon: Bot },
    { label: 'Safety & SOS', path: '/app/safety', icon: ShieldAlert },
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
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800/80 min-h-[calc(100vh-73px)] p-4">
      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-2xl font-semibold text-base transition-colors touch-target ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
