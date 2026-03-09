import React from 'react';

interface SliderProps {
  variant: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Slider: React.FC<SliderProps> = ({ variant, size = 'md', children }) => {
  const colorClass = {
    primary: 'bg-blue-500 hover:bg-blue-600',
    neutral: 'bg-slate-500 hover:bg-slate-600',
    danger: 'bg-red-500 hover:bg-red-600',
    success: 'bg-green-500 hover:bg-green-600',
  };

  const sizeClass = {
    sm: 'h-4 w-full',
    md: 'h-6 w-full',
    lg: 'h-8 w-full',
  };

  return (
    <button
      aria-label="Slider"
      className={`rounded-lg shadow-sm transition-all duration-200 ${colorClass[variant]} ${sizeClass[size]} text-white`}
    >
      {children}
    </button>
  );
};

export default Slider;

export const __demo = () => (
  <div>
    <Slider variant="primary">Primary</Slider>
    <Slider variant="neutral">Neutral</Slider>
    <Slider variant="danger">Danger</Slider>
    <Slider variant="success">Success</Slider>
  </div>
);