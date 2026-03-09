import React from 'react';

interface ButtonProps {
  variant: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant, size = 'medium', children }) => {
  const baseClasses = 'rounded-lg shadow-sm transition-all duration-200';
  let colorClasses: string;

  switch (variant) {
    case 'primary':
      colorClasses = 'bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50';
      break;
    case 'neutral':
      colorClasses = 'bg-slate-800 text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:ring-opacity-50';
      break;
    case 'danger':
      colorClasses = 'bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50';
      break;
    case 'success':
      colorClasses = 'bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50';
      break;
    default:
      colorClasses = 'bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50';
  }

  let sizeClasses: string;

  switch (size) {
    case 'small':
      sizeClasses = 'px-2 py-1 text-sm';
      break;
    case 'large':
      sizeClasses = 'px-4 py-2 text-lg';
      break;
    default:
      sizeClasses = 'px-3 py-1.5 text-base';
  }

  return (
    <button
      className={`${baseClasses} ${colorClasses} ${sizeClasses}`}
      aria-label={children as string}
    >
      {children}
    </button>
  );
};

export default Button;

export const __demo: React.FC = () => (
  <div>
    <Button variant="primary" aria-label="Primary Button">
      Primary
    </Button>
    <Button variant="neutral" aria-label="Neutral Button">
      Neutral
    </Button>
    <Button variant="danger" aria-label="Danger Button">
      Danger
    </Button>
    <Button variant="success" aria-label="Success Button">
      Success
    </Button>
  </div>
);