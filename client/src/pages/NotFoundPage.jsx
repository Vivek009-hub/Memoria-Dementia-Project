import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <HelpCircle className="w-16 h-16 text-slate-500 mb-4" />
      <h2 className="text-3xl font-black text-white">404 — Page Not Found</h2>
      <p className="text-slate-400 max-w-md my-2">
        We couldn't find the page you were looking for.
      </p>
      <Link to="/" className="mt-4">
        <Button variant="secondary">Back to Homepage</Button>
      </Link>
    </div>
  );
}
