import React from 'react';
import { Card } from '../components/common/Card.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function DashboardPlaceholder({ title = 'Overview Dashboard', module = 'F0 Foundation' }) {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">{title}</h2>
          <p className="text-slate-400 text-sm mt-1">Welcome back, {user?.name || user?.email}</p>
        </div>
        <Badge variant="brand">{module}</Badge>
      </div>

      <Card title="Module Scaffold Foundation">
        <p className="text-slate-300 text-base">
          This is the foundational layout scaffold for <strong className="text-white">{title}</strong>.
        </p>
        <p className="text-sm text-slate-400 mt-2">
          Connected to authenticated session: <code className="text-brand-300">{user?.email}</code> ({user?.role}).
        </p>
      </Card>
    </div>
  );
}
