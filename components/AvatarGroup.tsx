import React from 'react';
import { Avatar } from 'react-tailwindcss-avatar';

interface AvatarGroupProps {
  variant: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({ variant, size = 'md', children }) => {
  const getColorClass = (variant: AvatarGroupProps['variant']) => {
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
        return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="flex items-center space-x-2 rounded-lg shadow-sm transition-all duration-200" aria-label="Avatar Group">
      {React.Children.map(children, (child, index) => (
        <Avatar
          key={index}
          className={`rounded-full ${getColorClass(variant)} ${size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : 'w-12 h-12'} shadow-none`}
          name="avatar"
          round={false}
        >
          {child}
        </Avatar>
      ))}
    </div>
  );
};

const __demo: React.FC = () => (
  <div className="flex flex-col space-y-4">
    <AvatarGroup variant="primary">
      <Avatar initials="AB" />
      <Avatar initials="CD" />
      <Avatar initials="EF" />
    </AvatarGroup>
    <AvatarGroup variant="neutral">
      <Avatar initials="GH" />
      <Avatar initials="IJ" />
      <Avatar initials="KL" />
    </AvatarGroup>
    <AvatarGroup variant="danger">
      <Avatar initials="MN" />
      <Avatar initials="OP" />
      <Avatar initials="QR" />
    </AvatarGroup>
    <AvatarGroup variant="success">
      <Avatar initials="ST" />
      <Avatar initials="UV" />
      <Avatar initials="WX" />
    </AvatarGroup>
  </div>
);

export default AvatarGroup;
export { __demo };