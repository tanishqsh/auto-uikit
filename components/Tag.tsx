import React from 'react';

interface TagProps {
  variant?: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

const Tag: React.FC<TagProps> = ({ variant = 'primary', size = 'medium', children }) => {
  const getTagColor = (variant: TagProps['variant']) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 text-white';
      case 'neutral':
        return 'bg-slate-200 text-slate-900';
      case 'danger':
        return 'bg-red-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getTagSize = (size: TagProps['size']) => {
    switch (size) {
      case 'small':
        return 'px-2 py-1 text-xs';
      case 'medium':
        return 'px-3 py-1.5 text-sm';
      case 'large':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg shadow-sm transition-all duration-200 ${getTagColor(variant)} ${getTagSize(size)} ${variant === 'primary' ? 'hover:bg-blue-600' : ''} ${variant === 'neutral' ? 'hover:bg-slate-300' : ''} ${variant === 'danger' ? 'hover:bg-red-600' : ''} ${variant === 'success' ? 'hover:bg-green-600' : ''}`}
      role="tag"
      aria-label={children.toString()}
    >
      {children}
    </span>
  );
};

export default Tag;

export const __demo = () => (
  <div>
    <Tag variant="primary" size="small">
      Primary
    </Tag>
    <Tag variant="neutral" size="medium">
      Neutral
    </Tag>
    <Tag variant="danger" size="large">
      Danger
    </Tag>
    <Tag variant="success" size="small">
      Success
    </Tag>
  </div>
);