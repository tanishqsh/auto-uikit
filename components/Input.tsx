import React from 'react';

interface InputProps {
  variant: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ variant, size = 'md', children }) => {
  const variantClass = {
    primary: 'bg-blue-500 text-white',
    neutral: 'bg-slate-200 text-slate-900',
    danger: 'bg-red-500 text-white',
    success: 'bg-green-500 text-white',
  }[variant];

  const sizeClass = {
    sm: 'py-1 px-2 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
  }[size];

  return (
    <input
      className={`rounded-lg shadow-sm transition-all duration-200 ${variantClass} ${sizeClass}`}
      aria-label="Input"
      role="textbox"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          console.log('Enter pressed');
        }
      }}
    >
      {children}
    </input>
  );
};

const __demo: React.FC = () => (
  <div>
    <Input variant="primary" size="sm" aria-label="Primary Small">
      Primary Small
    </Input>
    <Input variant="neutral" size="md" aria-label="Neutral Medium">
      Neutral Medium
    </Input>
    <Input variant="danger" size="lg" aria-label="Danger Large">
      Danger Large
    </Input>
    <Input variant="success" size="md" aria-label="Success Medium">
      Success Medium
    </Input>
  </div>
);

export default Input;
export { __demo };