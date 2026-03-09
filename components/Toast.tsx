import React from 'react';

interface ToastProps {
  variant: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Toast: React.FC<ToastProps> = ({ variant, size = 'md', children }) => {
  const getColorClass = () => {
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

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`rounded-lg shadow-sm transition-all duration-200 p-4 ${getColorClass()} ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}`}
    >
      {children}
    </div>
  );
};

export default Toast;

export const __demo: React.FC = () => (
  <div>
    <Toast variant="primary" size="sm">
      Primary Toast
    </Toast>
    <Toast variant="neutral">
      Neutral Toast
    </Toast>
    <Toast variant="danger" size="lg">
      Danger Toast
    </Toast>
    <Toast variant="success">
      Success Toast
    </Toast>
  </div>
);