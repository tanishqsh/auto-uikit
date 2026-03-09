import React from 'react';

interface TimelineProps {
  variant?: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

const Timeline: React.FC<TimelineProps> = ({ variant = 'primary', size = 'medium', children }) => {
  const getColorClass = (variant: TimelineProps['variant']) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-100 text-blue-800';
      case 'neutral':
        return 'bg-slate-100 text-slate-800';
      case 'danger':
        return 'bg-red-100 text-red-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getSizeClass = (size: TimelineProps['size']) => {
    switch (size) {
      case 'small':
        return 'py-1 px-2';
      case 'large':
        return 'py-3 px-4';
      default:
        return 'py-2 px-3';
    }
  };

  return (
    <div
      className={`rounded-lg shadow-sm transition-all duration-200 ${getSizeClass(size)} ${getColorClass(variant)}`}
      role="list"
      aria-label="Timeline"
    >
      {children}
    </div>
  );
};

export default Timeline;

export const __demo: React.FC = () => (
  <div className="space-y-4">
    <Timeline variant="primary" size="large">
      Primary Large
    </Timeline>
    <Timeline variant="neutral" size="medium">
      Neutral Medium
    </Timeline>
    <Timeline variant="danger" size="small">
      Danger Small
    </Timeline>
    <Timeline variant="success">
      Success Default
    </Timeline>
  </div>
);