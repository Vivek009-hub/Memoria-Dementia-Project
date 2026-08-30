import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';

export function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <ShieldAlert className="w-16 h-16 text-red-400 mb-4" />
      <h2 className="text-3xl font-black text-white">403 — Access Denied</h2>
      <p className="text-slate-400 max-w-md my-2">
        You do not have the required permissions to view this page.
      </p>
      <Link to="/app" className="mt-4">
        <Button variant="secondary">Back to Dashboard</Button>
      </Link>
    </div>
  );
}
