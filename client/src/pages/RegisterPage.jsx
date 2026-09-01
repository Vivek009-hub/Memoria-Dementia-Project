import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Card } from '../components/common/Card.jsx';
import { Input } from '../components/common/Input.jsx';
import { Button } from '../components/common/Button.jsx';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PATIENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await register({ name, email, password, role });
      if (res.success) {
        navigate('/app');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 px-4 max-w-md mx-auto">
      <Card title="Create Memora Account">
        {error && (
          <div className="p-3 mb-4 bg-[#C95C5C]/10 border border-[#C95C5C]/30 rounded-lg text-[#C95C5C] text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
          />

          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@memora.com"
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <div>
            <label className="block text-sm font-medium text-[#E8E8E8] mb-1">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#252525] border border-[#383838] rounded-lg text-[#E8E8E8] focus:outline-none focus:border-[#DDBB55] text-sm"
            >
              <option value="PATIENT">Patient Account</option>
              <option value="CAREGIVER">Caregiver Account</option>
            </select>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Register Account
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-[#A0A0A0]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#DDBB55] font-semibold hover:underline">
            Sign In here
          </Link>
        </div>
      </Card>
    </div>
  );
}

