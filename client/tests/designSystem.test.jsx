import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { Button } from '../src/components/common/Button.jsx';
import { Alert } from '../src/components/common/Alert.jsx';
import { SafetyAlert } from '../src/components/common/SafetyAlert.jsx';
import { StatusBadge } from '../src/components/common/StatusBadge.jsx';
import { Progress } from '../src/components/common/Progress.jsx';
import { GameCard } from '../src/components/primitives/GameCard.jsx';
import { MemoryCard } from '../src/components/primitives/MemoryCard.jsx';

describe('Design System UI Components (Phase F1)', () => {
  it('renders Button with touch target accessibility standards and triggers click handler', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeDefined();
    expect(btn.className).toContain('touch-target');

    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders SafetyAlert with emergency SOS styling and action callback', () => {
    const handleAction = vi.fn();
    render(
      <SafetyAlert
        status="EMERGENCY"
        message="Fall Detected!"
        onAction={handleAction}
        actionLabel="View Event"
      />
    );

    expect(screen.getByText(/EMERGENCY SOS ALERT/i)).toBeDefined();
    expect(screen.getByText(/Fall Detected!/i)).toBeDefined();

    const actionBtn = screen.getByRole('button', { name: /view event/i });
    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('renders StatusBadge supporting backend enum values', () => {
    const { rerender } = render(<StatusBadge status="ACTIVE" />);
    expect(screen.getByText('Active')).toBeDefined();

    rerender(<StatusBadge status="EMERGENCY" />);
    expect(screen.getByText(/Emergency SOS/i)).toBeDefined();
  });

  it('calculates percentage accurately in Progress component', () => {
    render(<Progress value={40} max={100} label="Cognitive Score" />);
    expect(screen.getByText('Cognitive Score')).toBeDefined();
    expect(screen.getByText('40%')).toBeDefined();
  });

  it('renders GameCard and MemoryCard primitives', () => {
    render(
      <GameCard
        title="Card Match Memory"
        category="Memory Games"
        difficulty="MEDIUM"
        onPlay={() => {}}
      />
    );
    expect(screen.getByText('Card Match Memory')).toBeDefined();
    expect(screen.getByText('Memory Games')).toBeDefined();

    render(
      <MemoryCard
        title="Lake House Reunion"
        description="Grandchildren visiting lake house."
      />
    );
    expect(screen.getByText('Lake House Reunion')).toBeDefined();
    expect(screen.getByText('Grandchildren visiting lake house.')).toBeDefined();
  });
});
