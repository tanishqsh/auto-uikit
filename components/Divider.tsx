import React from 'react';

interface DividerProps {
  variant: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  children?: React.ReactNode;
}

const Divider: React.FC<DividerProps> = ({ variant, size = 'medium', children }) => {
  const colorClass = {
    primary: 'bg-blue-500',
    neutral: 'bg-slate-300',
    danger: 'bg-red-500',
    success: 'bg-green-500',
  };

  const sizeClass = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-3',
  };

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={`rounded-lg shadow-sm transition-all duration-200 ${colorClass[variant]} ${sizeClass[size]} w-full`}
    >
      {children}
    </div>
  );
};

export default Divider;

export const __demo: React.FC = () => (
  <div>
    <Divider variant="primary" size="small">Primary Small</Divider>
    <Divider variant="neutral" size="medium">Neutral Medium</Divider>
    <Divider variant="danger" size="large">Danger Large</Divider>
    <Divider variant="success">Success Default</Divider>
  </div>
);