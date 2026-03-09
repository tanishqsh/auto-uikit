import React from 'react';
import { StepperProps } from './Stepper.types';

const Stepper: React.FC<StepperProps> = ({ variant, size, children }) => {
  const getColorClass = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 text-white';
      case 'neutral':
        return 'bg-slate-200 text-slate-700';
      case 'danger':
        return 'bg-red-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'small':
        return 'py-1 px-2 text-sm';
      case 'medium':
        return 'py-2 px-4 text-base';
      case 'large':
        return 'py-3 px-6 text-lg';
      default:
        return 'py-2 px-4 text-base';
    }
  };

  return (
    <div
      role="stepper"
      className={`rounded-lg shadow-sm transition-all duration-200 ${getColorClass(
        variant
      )} ${getSizeClass(size)}`}
    >
      {children}
    </div>
  );
};

export default Stepper;

export const __demo: React.FC = () => (
  <div>
    <Stepper variant="primary" size="medium">
      Step 1
    </Stepper>
    <Stepper variant="neutral" size="large">
      Step 2
    </Stepper>
    <Stepper variant="danger" size="small">
      Step 3
    </Stepper>
  </div>
);