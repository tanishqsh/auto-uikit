import React, { useState } from 'react';

interface CheckboxProps {
  variant?: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Checkbox: React.FC<CheckboxProps> = ({ variant = 'primary', size = 'md', children }) => {
  const [checked, setChecked] = useState(false);

  const colorClass = {
    primary: 'text-blue-600 border-blue-600 bg-blue-50 focus:ring-blue-500',
    neutral: 'text-slate-600 border-slate-600 bg-slate-50 focus:ring-slate-500',
    danger: 'text-red-600 border-red-600 bg-red-50 focus:ring-red-500',
    success: 'text-green-600 border-green-600 bg-green-50 focus:ring-green-500',
  }[variant];

  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }[size];

  return (
    <label className={`inline-flex items-center ${sizeClass} cursor-pointer ${colorClass}`} role="checkbox" aria-checked={checked}>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => setChecked(!checked)}
        className="hidden"
        aria-label="checkbox"
      />
      <span className="rounded-lg shadow-sm transition-all duration-200"></span>
      <span className="ml-2">{children}</span>
    </label>
  );
};

const __demo: React.FC = () => {
  return (
    <div>
      <Checkbox variant="primary" size="sm" aria-label="Primary Small Checkbox">
        Primary Small
      </Checkbox>
      <Checkbox variant="neutral" size="md" aria-label="Neutral Medium Checkbox">
        Neutral Medium
      </Checkbox>
      <Checkbox variant="danger" size="lg" aria-label="Danger Large Checkbox">
        Danger Large
      </Checkbox>
      <Checkbox variant="success" size="sm" aria-label="Success Small Checkbox">
        Success Small
      </Checkbox>
    </div>
  );
};

export default Checkbox;
export { __demo };