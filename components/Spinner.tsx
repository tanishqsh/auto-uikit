import React from 'react';

interface SpinnerProps {
  variant?: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const Spinner: React.FC<SpinnerProps> = ({ variant = 'primary', size = 'md', children }) => {
  const getColor = (variant: SpinnerProps['variant']) => {
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

  const getSize = (size: SpinnerProps['size']) => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'md':
        return 'h-6 w-6';
      case 'lg':
        return 'h-8 w-8';
      default:
        return 'h-6 w-6';
    }
  };

  return (
    <div className={`flex items-center justify-center ${getSize(size)}`}>
      <div
        role="status"
        className={`inline-block h-8 w-8 animate-spin rounded-full border-4 border-t-transparent ${getColor(
          variant
        )} shadow-sm transition-all duration-200`}
        aria-label="loading"
      ></div>
      {children && <span className="ml-2">{children}</span>}
    </div>
  );
};

export default Spinner;

export const __demo = () => (
  <div className="flex flex-col space-y-4">
    <Spinner variant="primary">Loading...</Spinner>
    <Spinner variant="neutral">Loading...</Spinner>
    <Spinner variant="danger">Loading...</Spinner>
    <Spinner variant="success">Loading...</Spinner>
  </div>
);