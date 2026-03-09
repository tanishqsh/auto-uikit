import React from 'react';

interface AvatarProps {
  variant: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({ variant, size = 'medium', children }) => {
  const getColorClass = (variant: AvatarProps['variant']) => {
    return {
      primary: 'bg-blue-500 text-white',
      neutral: 'bg-slate-500 text-white',
      danger: 'bg-red-500 text-white',
      success: 'bg-green-500 text-white',
    }[variant] || 'bg-slate-500 text-white';
  };

  const getSizeClass = (size: AvatarProps['size']) => {
    return {
      small: 'w-8 h-8 text-xs',
      large: 'w-12 h-12 text-lg',
      medium: 'w-10 h-10 text-base',
    }[size] || 'w-10 h-10 text-base';
  };

  return (
    <div
      className={`flex items-center justify-center rounded-lg shadow-sm transition-all duration-200 ${getColorClass(
        variant
      )} ${getSizeClass(size)}`}
      role="img"
      aria-label="Avatar"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && alert('Avatar clicked')}
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