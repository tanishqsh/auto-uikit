import React, { useState } from 'react';

interface AccordionProps {
  variant: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ variant, size = 'medium', children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getVariantClasses = (variant: AccordionProps['variant'], size: AccordionProps['size']) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200';
      case 'neutral':
        return 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200';
      case 'danger':
        return 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200';
      case 'success':
        return 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200';
      default:
        return '';
    }
  };

  const getSizeClasses = (size: AccordionProps['size']) => {
    switch (size) {
      case 'small':
        return 'py-2 px-4 text-sm';
      case 'large':
        return 'py-4 px-6 text-lg';
      default:
        return 'py-3 px-5 text-base';
    }
  };

  return (
    <div className={`rounded-lg shadow-sm transition-all duration-200 ${getVariantClasses(variant, size)}`}>
      <button
        className={`w-full flex justify-between items-center ${getSizeClasses(size)} border-b focus:outline-none`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Toggle accordion"
        role="button"
      >
        {children}
      </button>
      {isOpen && (
        <div className="p-4" role="region" aria-label="Accordion content">
          {/* Content goes here */}
          Additional content
        </div>
      )}
    </div>
  );
};

export default Accordion;

export const __demo: React.FC = () => (
  <div>
    <Accordion variant="primary" size="medium">
      Primary Accordion
    </Accordion>
    <Accordion variant="neutral" size="large">
      Neutral Accordion
    </Accordion>
    <Accordion variant="danger" size="small">
      Danger Accordion
    </Accordion>
    <Accordion variant="success">
      Success Accordion
    </Accordion>
  </div>
);