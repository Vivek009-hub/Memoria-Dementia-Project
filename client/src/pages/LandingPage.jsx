import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Brain, Heart, Bell, Users, ShieldAlert } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';

export function LandingPage() {
  return (
    <div className="py-16 px-6 max-w-6xl mx-auto space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-brand-500/10 border border-brand-500/30 rounded-full text-brand-300 font-bold text-sm">
          <Shield className="w-4 h-4" />
          <span>AI-Powered Cognitive Care & Safety</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
          Empowering Care & Connection for Dementia Patients
        </h1>
        <p className="text-xl text-slate-400 font-medium">
          Memora supports cognitive health, memory assistance, daily routines, community interaction, and real-time personal safety.
        </p>
        <div className="flex items-center justify-center space-x-4 pt-4">
          <Link to="/register">
            <Button size="xl" variant="primary">
              Get Started
            </Button>
          </Link>
          <Link to="/login">
            <Button size="xl" variant="secondary">
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      {/* Core Platform Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Cognitive Stimulation">
          <Brain className="w-10 h-10 text-brand-400 mb-3" />
          <p className="text-slate-400 text-sm">
            Adaptive memory and matching games designed specifically to encourage cognitive engagement.
          </p>
        </Card>

        <Card title="Memory & Family Assistance">
          <Heart className="w-10 h-10 text-rose-400 mb-3" />
          <p className="text-slate-400 text-sm">
            Personal memory logs and familiar faces repository to aid daily recall and personal connections.
          </p>
        </Card>

        <Card title="Smart Routine Reminders">
          <Bell className="w-10 h-10 text-amber-400 mb-3" />
          <p className="text-slate-400 text-sm">
            Caregiver-managed medicine and daily routine reminders with adherence progress tracking.
          </p>
        </Card>

        <Card title="Community & Meetings">
          <Users className="w-10 h-10 text-sky-400 mb-3" />
          <p className="text-slate-400 text-sm">
            Pre-registered community workshops and Memora Meeting Circles led by specialists and hosts.
          </p>
        </Card>

        <Card title="AI Voice Companion">
          <Brain className="w-10 h-10 text-indigo-400 mb-3" />
          <p className="text-slate-400 text-sm">
            Natural language conversational assistant tailored for memory support and gentle interaction.
          </p>
        </Card>

        <Card title="Safety & Emergency Infrastructure">
          <ShieldAlert className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-slate-400 text-sm">
            Real-time SOS triggers, safe-zone geofencing, fall event alerts, and immediate caregiver notifications.
          </p>
        </Card>
      </div>
    </div>
  );
}
