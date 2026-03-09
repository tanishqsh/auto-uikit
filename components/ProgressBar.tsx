import React from 'react';

interface ProgressBarProps {
  variant?: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  variant = 'primary',
  size = 'md',
  children,
}) => {
  const getColor = (variant: ProgressBarProps['variant']) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500';
      case 'neutral':
        return 'bg-slate-500';
      case 'danger':
        return 'bg-red-500';
      case 'success':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getSize = (size: ProgressBarProps['size']) => {
    switch (size) {
      case 'sm':
        return 'h-2';
      case 'md':
        return 'h-4';
      case 'lg':
        return 'h-6';
      default:
        return 'h-4';
    }
  };

  return (
    <div
      role="progressbar"
      aria-valuenow="0"
      aria-valuemin="0"
      aria-valuemax="100"
      className={`rounded-lg shadow-sm transition-all duration-200 ${getSize(
        size
      )} ${getColor(variant)}`}
    >
      {children}
    </div>
  );
};

export default ProgressBar;

export const __demo = () => (
  <div className="flex flex-col space-y-4">
    <ProgressBar variant="primary">Primary</ProgressBar>
    <ProgressBar variant="neutral">Neutral</ProgressBar>
    <ProgressBar variant="danger">Danger</ProgressBar>
    <ProgressBar variant="success">Success</ProgressBar>
  </div>
);