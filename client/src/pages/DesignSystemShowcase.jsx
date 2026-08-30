import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { Textarea } from '../components/common/Textarea.jsx';
import { Select } from '../components/common/Select.jsx';
import { Checkbox } from '../components/common/Checkbox.jsx';
import { Radio } from '../components/common/Radio.jsx';
import { Switch } from '../components/common/Switch.jsx';
import { DateInput } from '../components/common/DateInput.jsx';
import { TimeInput } from '../components/common/TimeInput.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { SafetyAlert } from '../components/common/SafetyAlert.jsx';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { Progress } from '../components/common/Progress.jsx';
import { Avatar } from '../components/common/Avatar.jsx';
import { Table } from '../components/common/Table.jsx';
import { SearchInput } from '../components/common/SearchInput.jsx';
import { Toast } from '../components/common/Toast.jsx';
import { Modal } from '../components/common/Modal.jsx';

import { VoiceButton } from '../components/primitives/VoiceButton.jsx';
import { VoiceStatus } from '../components/primitives/VoiceStatus.jsx';
import { GameCard } from '../components/primitives/GameCard.jsx';
import { MemoryCard } from '../components/primitives/MemoryCard.jsx';
import { ReminderCard } from '../components/primitives/ReminderCard.jsx';
import { SessionCard } from '../components/primitives/SessionCard.jsx';
import { MeetingCard } from '../components/primitives/MeetingCard.jsx';
import { AIChatBubble } from '../components/primitives/AIChatBubble.jsx';
import { SOSButtonPrimitive } from '../components/primitives/SOSButtonPrimitive.jsx';

export function DesignSystemShowcase() {
  const [toggleVal, setToggleVal] = useState(true);
  const [radioVal, setRadioVal] = useState('a');
  const [searchVal, setSearchVal] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const sampleTableData = [
    { id: 1, name: 'John Doe', role: 'PATIENT', status: 'ACTIVE', lastSeen: '10 mins ago' },
    { id: 2, name: 'Jane Smith', role: 'CAREGIVER', status: 'RESOLVED', lastSeen: '1 hour ago' },
  ];

  const tableColumns = [
    { header: 'User', render: (row) => <div className="flex items-center space-x-2"><Avatar name={row.name} size="sm" /><span>{row.name}</span></div> },
    { header: 'Role', key: 'role' },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Last Seen', key: 'lastSeen' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 bg-slate-950 text-slate-100 min-h-screen">
      <PageHeader
        title="Memora Design System Showcase"
        description="Elder-friendly, accessible UI component library and visual tokens."
        badge={<StatusBadge status="ACTIVE" />}
        action={<Button onClick={() => setToastMsg('Design system test toast!')}>Trigger Toast</Button>}
      />

      {/* Typography & Regional Language Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black border-b border-slate-800 pb-2">1. Typography & Regional Scripts</h2>
        <Card className="space-y-3">
          <h1 className="text-4xl font-extrabold text-white">Display Heading — English (44px)</h1>
          <h1 className="text-3xl font-bold text-white">मेमोरा डिज़ाइन सिस्टम — Hindi Typography (30px)</h1>
          <p className="text-base text-slate-300">
            Standard Body Text: High-contrast, calm, and readable for elder users with generous touch targets.
          </p>
          <p className="text-sm text-slate-400">
            Muted Caption: Secondary details with contrast ratio adhering to accessibility guidelines.
          </p>
        </Card>
      </section>

      {/* Button System */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black border-b border-slate-800 pb-2">2. Button System (Touch Targets ≥ 48px)</h2>
        <Card className="flex flex-wrap gap-4 items-center">
          <Button variant="primary" size="lg">Primary Action</Button>
          <Button variant="secondary" size="lg">Secondary Action</Button>
          <Button variant="outline" size="lg">Outline Action</Button>
          <Button variant="danger" size="lg">Danger Action</Button>
          <Button variant="primary" size="lg" loading>Loading State</Button>
          <Button variant="primary" size="lg" disabled>Disabled State</Button>
        </Card>
      </section>

      {/* Form Controls */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black border-b border-slate-800 pb-2">3. Accessible Form Controls</h2>
        <Card className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Text Input Field" placeholder="Enter patient name..." />
          <Select
            label="Select Control"
            options={[
              { label: 'Patient Account', value: 'PATIENT' },
              { label: 'Caregiver Account', value: 'CAREGIVER' },
            ]}
          />
          <DateInput label="Date Selection" />
          <TimeInput label="Reminder Time" />
          <Textarea label="Memory Description" placeholder="Write memory details here..." />
          <div className="space-y-3">
            <Checkbox label="Enable SOS Geofence Alerts" description="Receive immediate notification when patient exits safe area." defaultChecked />
            <Switch label="Voice Assistant Feedback" checked={toggleVal} onChange={setToggleVal} />
            <div className="flex space-x-6 pt-2">
              <Radio name="option" value="a" label="Option A" checked={radioVal === 'a'} onChange={() => setRadioVal('a')} />
              <Radio name="option" value="b" label="Option B" checked={radioVal === 'b'} onChange={() => setRadioVal('b')} />
            </div>
          </div>
        </Card>
      </section>

      {/* Alerts & Safety Banners */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black border-b border-slate-800 pb-2">4. Alert Banners & Emergency Safety Status</h2>
        <div className="space-y-4">
          <Alert variant="info" title="Routine Update">Daily medicine reminder scheduled for 09:00 AM.</Alert>
          <Alert variant="success" title="Memory Saved">Memory entry saved successfully.</Alert>
          <Alert variant="danger" title="Connection Offline">System is currently offline. Local cache active.</Alert>
          <SafetyAlert status="EMERGENCY" message="Possible Fall Detected in Living Room!" onAction={() => setIsModalOpen(true)} />
        </div>
      </section>

      {/* Status Badges & Progress */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black border-b border-slate-800 pb-2">5. Status Badges & Progress Indicators</h2>
        <Card className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="ACTIVE" />
            <StatusBadge status="PENDING" />
            <StatusBadge status="COMPLETED" />
            <StatusBadge status="SAFE" />
            <StatusBadge status="WARNING" />
            <StatusBadge status="EMERGENCY" />
          </div>
          <Progress value={75} max={100} label="Daily Cognitive Activity Progress" />
        </Card>
      </section>

      {/* Table Component */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black border-b border-slate-800 pb-2">6. Table & Search Primitives</h2>
        <div className="space-y-4">
          <SearchInput value={searchVal} onChange={setSearchVal} placeholder="Search patients or caregivers..." />
          <Table columns={tableColumns} data={sampleTableData} />
        </div>
      </section>

      {/* Voice & Domain Cards Scaffolds */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black border-b border-slate-800 pb-2">7. Voice & Feature Scaffolds</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <Card className="space-y-4 text-center flex flex-col items-center">
            <VoiceButton isListening={isListening} onClick={() => setIsListening(!isListening)} />
            <VoiceStatus isSpeaking={isListening} text={isListening ? 'Listening for voice command...' : 'Voice assistant ready.'} />
            <div className="pt-4">
              <SOSButtonPrimitive onTrigger={() => alert('SOS Triggered!')} />
            </div>
          </Card>

          <div className="space-y-4">
            <AIChatBubble message="Good morning, John! Would you like to view your routine reminders for today?" isUser={false} timestamp="09:00 AM" />
            <AIChatBubble message="Yes, please show my morning medication." isUser={true} timestamp="09:01 AM" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <GameCard title="Card Match Memory" category="Memory Stimulation" difficulty="MEDIUM" onPlay={() => alert('Start Game')} />
          <MemoryCard title="Family Reunion 2025" date="2025-06-15" description="Gathering at lake house with grandchildren." relationship="Family Log" />
          <ReminderCard title="Morning Blood Pressure Pill" time="2026-08-31T09:00:00.000Z" status="PENDING" onComplete={() => alert('Completed!')} />
          <SessionCard title="Dementia Caregiver Support Circle" description="Weekly virtual community sharing session." votes={12} onVote={() => {}} onRegister={() => {}} />
          <MeetingCard title="Dr. Smith Consultation" hostName="Dr. Robert Smith" scheduledAt="2026-09-01T10:00:00.000Z" status="SCHEDULED" onJoin={() => {}} />
        </div>
      </section>

      {/* Modal Dialog */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirm Emergency Event Resolution">
        <div className="space-y-4">
          <p className="text-slate-300">Are you sure you want to mark this emergency event as resolved?</p>
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => setIsModalOpen(false)}>Confirm Resolve</Button>
          </div>
        </div>
      </Modal>

      {/* Toast Popup */}
      <Toast message={toastMsg} onClose={() => setToastMsg('')} />
    </div>
  );
}
