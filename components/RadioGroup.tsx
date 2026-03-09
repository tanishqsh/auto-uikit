import React from 'react';

interface RadioGroupProps {
  variant?: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ variant = 'primary', size = 'md', children }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300';
      case 'neutral':
        return 'text-gray-900 bg-slate-100 hover:bg-slate-200 focus:ring-4 focus:ring-slate-300';
      case 'danger':
        return 'text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:ring-red-300';
      case 'success':
        return 'text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300';
      default:
        return 'text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300';
    }
  };

  const getSizeClasses = () => {
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
    <div className={`rounded-lg shadow-sm transition-all duration-200 ${getSizeClasses()} ${getVariantClasses()}`}>
      {children}
    </div>
  );
};

const __demo = () => {
  return (
    <div>
      <RadioGroup variant="primary" size="sm">
        Primary
      </RadioGroup>
      <RadioGroup variant="neutral" size="md">
        Neutral
      </RadioGroup>
      <RadioGroup variant="danger" size="lg">
        Danger
      </RadioGroup>
      <RadioGroup variant="success" size="sm">
        Success
      </RadioGroup>
    </div>
  );
};

export default RadioGroup;
export { __demo };