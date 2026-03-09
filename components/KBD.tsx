import React from 'react';

interface KBDProps {
  variant?: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

const KBD: React.FC<KBDProps> = ({ variant = 'primary', size = 'medium', children }) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 text-white';
      case 'neutral':
        return 'bg-slate-200 text-slate-800';
      case 'danger':
        return 'bg-red-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'py-1 px-2 text-xs';
      case 'medium':
        return 'py-2 px-4 text-sm';
      case 'large':
        return 'py-3 px-6 text-base';
      default:
        return 'py-2 px-4 text-sm';
    }
  };

  return (
    <button
      className={`rounded-lg shadow-sm transition-all duration-200 ${getVariantClass()} ${getSizeClass()} focus:outline-none`}
      aria-label={`Keyboard button with ${variant} variant and ${size} size`}
    >
      {children}
    </button>
  );
};

export default KBD;

export const __demo: React.FC = () => (
  <div>
    <KBD variant="primary" size="small">
      Primary Small
    </KBD>
    <KBD variant="neutral" size="medium">
      Neutral Medium
    </KBD>
    <KBD variant="danger" size="large">
      Danger Large
    </KBD>
    <KBD variant="success" size="small">
      Success Small
    </KBD>
  </div>
);