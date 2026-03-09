import React, { useState } from 'react';

interface TooltipProps {
  variant: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ variant, size = 'medium', children }) => {
  const getColor = (variant: TooltipProps['variant']) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 text-white';
      case 'neutral':
        return 'bg-slate-500 text-white';
      case 'danger':
        return 'bg-red-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getSize = (size: TooltipProps['size']) => {
    switch (size) {
      case 'small':
        return 'px-2 py-1';
      case 'large':
        return 'px-4 py-2';
      default:
        return 'px-3 py-1.5';
    }
  };

  const [isShown, setIsShown] = useState(false);

  return (
    <span className="relative" role="button" onClick={() => setIsShown(!isShown)} onKeyDown={(e) => e.key === 'Enter' && setIsShown(!isShown)} tabIndex={0}>
      {children}
      <div
        className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mt-2 rounded-lg shadow-sm transition-all duration-200 ${getColor(
          variant
        )} ${getSize(size)} ${isShown ? 'block' : 'hidden'}`}
        role="tooltip"
        aria-label="Tooltip text"
        aria-hidden={!isShown}
      >
        Tooltip text
      </div>
    </span>
  );
};

const __demo = () => (
  <div>
    <Tooltip variant="primary" size="large">
      Hover over me
    </Tooltip>
    <Tooltip variant="neutral" size="small">
      Hover over me
    </Tooltip>
    <Tooltip variant="danger" size="medium">
      Hover over me
    </Tooltip>
  </div>
);

export default Tooltip;
export { __demo };