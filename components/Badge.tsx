import React from 'react';

interface BadgeProps {
  variant: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ variant, size = 'md', children }) => {
  const sizeClass = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const colorClass = {
    primary: 'bg-blue-500 text-white',
    neutral: 'bg-slate-200 text-slate-800',
    danger: 'bg-red-500 text-white',
    success: 'bg-green-500 text-white',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg shadow-sm transition-all duration-200 ${sizeClass[size]} ${colorClass[variant]} aria-label="badge" role="status"}`
      aria-label={children.toString()}
    >
      {children}
    </span>
  );
};

export default Badge;

export const __demo = () => (
  <div>
    <Badge variant="primary" size="sm">
      Primary
    </Badge>
    <Badge variant="neutral" size="md">
      Neutral
    </Badge>
    <Badge variant="danger" size="lg">
      Danger
    </Badge>
    <Badge variant="success" size="sm">
      Success
    </Badge>
  </div>
);