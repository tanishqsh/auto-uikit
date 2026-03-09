import React from 'react';

interface AlertProps {
  variant?: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({ variant = 'primary', size = 'md', children }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'neutral':
        return 'bg-slate-100 text-slate-800 border border-slate-200';
      case 'danger':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'success':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-blue-100 text-blue-800 border border-blue-200';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 rounded-lg shadow-sm transition-all duration-200';
      case 'md':
        return 'px-6 py-3 rounded-lg shadow-sm transition-all duration-200';
      case 'lg':
        return 'px-8 py-4 rounded-lg shadow-sm transition-all duration-200';
      default:
        return 'px-6 py-3 rounded-lg shadow-sm transition-all duration-200';
    }
  };

  return (
    <div className={`${getVariantClasses()} ${getSizeClasses()} flex items-center`} role="alert">
      <span className="flex-shrink-0">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" role="img" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12h2v4h-2zm0 6h2v2h-2z" clipRule="evenodd" />
        </svg>
      </span>
      <div className="ml-3">{children}</div>
    </div>
  );
};

const __demo: React.FC = () => (
  <div>
    <Alert variant="primary" size="sm">
      This is a primary alert with small size.
    </Alert>
    <Alert variant="neutral" size="md">
      This is a neutral alert with medium size.
    </Alert>
    <Alert variant="danger" size="lg">
      This is a danger alert with large size.
    </Alert>
    <Alert variant="success" size="md">
      This is a success alert with medium size.
    </Alert>
  </div>
);

export default Alert;
export { __demo };