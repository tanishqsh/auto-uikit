import React from 'react';

interface AvatarProps {
  variant: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({ variant, size = 'medium', children }) => {
  const getColorClass = (variant: AvatarProps['variant']) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 text-white';
      case 'neutral':
        return 'bg-slate-500 text-white';
      case 'danger':
        return 'bg-red-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  const getSizeClass = (size: AvatarProps['size']) => {
    switch (size) {
      case 'small':
        return 'w-8 h-8 text-xs';
      case 'large':
        return 'w-12 h-12 text-lg';
      default:
        return 'w-10 h-10 text-base';
    }
  };

  return (
    <div
      className={`flex items-center justify-center rounded-lg shadow-sm transition-all duration-200 ${getColorClass(
        variant
      )} ${getSizeClass(size)}`}
      role="img"
      aria-label="Avatar"
    >
      {children}
    </div>
  );
};

export default Avatar;

export const __demo: React.FC = () => (
  <div>
    <Avatar variant="primary">P</Avatar>
    <Avatar variant="neutral">N</Avatar>
    <Avatar variant="danger">D</Avatar>
    <Avatar variant="success">S</Avatar>
  </div>
);