import React from 'react';

interface TextareaProps {
  variant?: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const Textarea: React.FC<TextareaProps> = ({ variant = 'primary', size = 'md', children }) => {
  const getVariantClass = (variant: TextareaProps['variant']) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 text-white';
      case 'neutral':
        return 'bg-slate-100 text-slate-900';
      case 'danger':
        return 'bg-red-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      default:
        return 'bg-slate-100 text-slate-900';
    }
  };

  const getSizeClass = (size: TextareaProps['size']) => {
    switch (size) {
      case 'sm':
        return 'py-1 px-2 text-sm';
      case 'md':
        return 'py-2 px-4 text-base';
      case 'lg':
        return 'py-3 px-6 text-lg';
      default:
        return 'py-2 px-4 text-base';
    }
  };

  return (
    <textarea
      className={`rounded-lg shadow-sm transition-all duration-200 ${getVariantClass(variant)} ${getSizeClass(size)} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-${variant}`}
      aria-label="Textarea"
      aria-describedby="textarea-description"
    >
      {children}
    </textarea>
  );
};

export default Textarea;

export const __demo = () => (
  <div>
    <Textarea variant="primary" size="sm">
      Primary Small
    </Textarea>
    <Textarea variant="neutral" size="md">
      Neutral Medium
    </Textarea>
    <Textarea variant="danger" size="lg">
      Danger Large
    </Textarea>
    <Textarea variant="success" size="sm">
      Success Small
    </Textarea>
  </div>
);