import React from 'react';

interface EmptyStateProps {
  variant?: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ variant = 'primary', size = 'medium', children }) => {
  const getClasses = () => {
    let classes = 'rounded-lg shadow-sm transition-all duration-200 p-4';
    switch (variant) {
      case 'primary':
        classes += ' bg-blue-50 text-blue-700 border border-blue-200';
        break;
      case 'neutral':
        classes += ' bg-slate-50 text-slate-700 border border-slate-200';
        break;
      case 'danger':
        classes += ' bg-red-50 text-red-700 border border-red-200';
        break;
      case 'success':
        classes += ' bg-green-50 text-green-700 border border-green-200';
        break;
      default:
        classes += ' bg-blue-50 text-blue-700 border border-blue-200';
    }
    switch (size) {
      case 'small':
        classes += ' text-sm';
        break;
      case 'large':
        classes += ' text-lg';
        break;
      default:
        classes += ' text-base';
    }
    return classes;
  };

  return (
    <div className={getClasses()} role="alert" aria-live="polite" aria-atomic="true">
      {children}
    </div>
  );
};

export default EmptyState;

export const __demo = () => (
  <div>
    <EmptyState variant="primary" size="medium">
      <p>No items found</p>
    </EmptyState>
    <EmptyState variant="neutral" size="large">
      <p>No results to display</p>
    </EmptyState>
    <EmptyState variant="danger" size="small">
      <p>Error loading data</p>
    </EmptyState>
    <EmptyState variant="success" size="medium">
      <p>Data loaded successfully</p>
    </EmptyState>
  </div>
);