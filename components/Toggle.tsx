import React, { useState } from 'react';

interface ToggleProps {
  variant?: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const Toggle: React.FC<ToggleProps> = ({ variant = 'primary', size = 'md', children }) => {
  const [isOn, setIsOn] = useState(false);

  return (
    <button
      className={[
        'rounded-lg shadow-sm transition-all duration-200',
        isOn ? 'bg-blue-500 text-white' : variant === 'primary' ? 'bg-blue-500 text-white' : variant === 'neutral' ? 'bg-slate-500 text-white' : variant === 'danger' ? 'bg-red-500 text-white' : variant === 'success' ? 'bg-green-500 text-white' : 'bg-slate-500 text-white',
        size === 'sm' ? 'px-2 py-1' : size === 'md' ? 'px-3 py-2' : 'px-4 py-3'
      ].join(' ')}
      aria-pressed={isOn}
      onClick={() => setIsOn(!isOn)}
    >
      {children}
    </button>
  );
};

export default Toggle;

export const __demo = () => (
  <div>
    <Toggle variant="primary" size="sm">
      Primary
    </Toggle>
    <Toggle variant="neutral" size="md">
      Neutral
    </Toggle>
    <Toggle variant="danger" size="lg">
      Danger
    </Toggle>
    <Toggle variant="success" size="sm">
      Success
    </Toggle>
  </div>
);