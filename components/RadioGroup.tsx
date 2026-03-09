import React, { useState } from 'react';

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
    <div
      role="group"
      aria-label="Button group"
      className={`inline-flex rounded-lg shadow-sm transition-all duration-200 ${getSizeClasses()} ${getVariantClasses()}`}
    >
      {children}
    </div>
  );
};

const RadioButton: React.FC<{ value: string; checked: boolean; onChange: (value: string) => void }> = ({
  value,
  checked,
  onChange,
}) => {
  const handleClick = () => {
    onChange(value);
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={`Select ${value}`}
      onClick={handleClick}
      className={`flex items-center justify-center rounded-l-lg border p-2 transition-colors ${
        checked ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {checked && <span className="w-4 h-4 bg-white rounded-full"></span>}
    </button>
  );
};

const __demo = () => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  return (
    <RadioGroup>
      <RadioButton value="Option 1" checked={selectedValue === 'Option 1'} onChange={setSelectedValue} />
      <RadioButton value="Option 2" checked={selectedValue === 'Option 2'} onChange={setSelectedValue} />
      <RadioButton value="Option 3" checked={selectedValue === 'Option 3'} onChange={setSelectedValue} />
    </RadioGroup>
  );
};

export default RadioGroup;
export { __demo };