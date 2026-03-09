import React from 'react';

interface StatProps {
  variant?: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Stat: React.FC<StatProps> = ({ variant = 'primary', size = 'md', children }) => {
  const getColorClass = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 text-white';
      case 'neutral':
        return 'bg-slate-100 text-slate-800';
      case 'danger':
        return 'bg-red-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  return (
    <div
      className={`rounded-lg shadow-sm transition-all duration-200 ${getColorClass()} ${getSizeClass()} text-center`}
      role="status"
      aria-busy="false"
      aria-live="polite"
    >
      {children}
    </div>
  );
};

export default Stat;

export const __demo = () => (
  <div className="flex flex-col gap-4">
    <Stat variant="primary" size="sm">
      Primary
    </Stat>
    <Stat variant="neutral" size="md">
      Neutral
    </Stat>
    <Stat variant="danger" size="lg">
      Danger
    </Stat>
    <Stat variant="success" size="sm">
      Success
    </Stat>
  </div>
);