import React from 'react';

interface SkeletonProps {
  variant?: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  children?: React.ReactNode;
}

const Skeleton: React.FC<SkeletonProps> = ({ variant = 'primary', size = 'medium', children }) => {
  const getVariantClass = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-200';
      case 'neutral':
        return 'bg-slate-200';
      case 'danger':
        return 'bg-red-200';
      case 'success':
        return 'bg-green-200';
      default:
        return 'bg-slate-200';
    }
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'small':
        return 'w-20 h-20';
      case 'medium':
        return 'w-40 h-40';
      case 'large':
        return 'w-60 h-60';
      default:
        return 'w-40 h-40';
    }
  };

  return (
    <div
      className={`${getVariantClass(variant)} rounded-lg shadow-sm transition-all duration-200`}
      role="alert"
      aria-label="Loading"
    >
      {children}
    </div>
  );
};

const __demo = () => (
  <div>
    <Skeleton variant="primary" size="small" />
    <Skeleton variant="neutral" size="medium" />
    <Skeleton variant="danger" size="large" />
  </div>
);

export default Skeleton;
export { __demo };