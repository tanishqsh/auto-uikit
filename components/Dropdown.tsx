import React, { ReactNode } from 'react';

interface DropdownProps {
  variant?: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ variant = 'primary', size = 'md', children }) => {
  const getVariantClass = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      case 'neutral':
        return 'bg-slate-200 text-slate-900 hover:bg-slate-300';
      case 'danger':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'success':
        return 'bg-green-500 text-white hover:bg-green-600';
      default:
        return 'bg-blue-500 text-white hover:bg-blue-600';
    }
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'md':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-4 py-3 text-base';
      default:
        return 'px-3 py-2 text-sm';
    }
  };

  return (
    <div
      className={`rounded-lg shadow-sm transition-all duration-200 ${getVariantClass(
        variant
      )} ${getSizeClass(size)} relative`}
      role="button"
      tabIndex={0}
      aria-label="Dropdown button"
    >
      {children}
      <div className="hidden absolute mt-2 w-full rounded-lg shadow-lg bg-white divide-y divide-gray-100">
        <div className="px-4 py-3 text-sm text-gray-900">Option 1</div>
        <div className="px-4 py-3 text-sm text-gray-900">Option 2</div>
        <div className="px-4 py-3 text-sm text-gray-900">Option 3</div>
      </div>
    </div>
  );
};

export default Dropdown;

export const __demo = () => (
  <div className="flex flex-col space-y-4">
    <Dropdown variant="primary" size="sm">
      Primary Dropdown
    </Dropdown>
    <Dropdown variant="neutral" size="md">
      Neutral Dropdown
    </Dropdown>
    <Dropdown variant="danger" size="lg">
      Danger Dropdown
    </Dropdown>
    <Dropdown variant="success" size="md">
      Success Dropdown
    </Dropdown>
  </div>
);