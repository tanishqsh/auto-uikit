import React from 'react';

interface CardProps {
  variant: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ variant, size = 'md', children }) => {
  let className = 'rounded-lg shadow-sm transition-all duration-200';

  switch (variant) {
    case 'primary':
      className += ' bg-blue-500 text-white hover:bg-blue-600';
      break;
    case 'neutral':
      className += ' bg-slate-200 text-slate-900 hover:bg-slate-300';
      break;
    case 'danger':
      className += ' bg-red-500 text-white hover:bg-red-600';
      break;
    case 'success':
      className += ' bg-green-500 text-white hover:bg-green-600';
      break;
    default:
      className += ' bg-slate-200 text-slate-900 hover:bg-slate-300';
  }

  switch (size) {
    case 'sm':
      className += ' p-2';
      break;
    case 'md':
      className += ' p-4';
      break;
    case 'lg':
      className += ' p-6';
      break;
    default:
      className += ' p-4';
  }

  return (
    <div className={className} role="region" aria-label={`Card variant ${variant}`}>
      {children}
    </div>
  );
};

export default Card;

export const __demo = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card variant="primary">Primary</Card>
    <Card variant="neutral">Neutral</Card>
    <Card variant="danger">Danger</Card>
    <Card variant="success">Success</Card>
  </div>
);