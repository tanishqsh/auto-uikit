import React from 'react';

interface BreadcrumbsProps {
  variant?: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ variant = 'primary', size = 'md', children }) => {
  const getVariantClass = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      case 'neutral':
        return 'bg-slate-200 text-slate-700 hover:bg-slate-300';
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
        return 'text-sm px-2 py-1';
      case 'md':
        return 'text-base px-3 py-2';
      case 'lg':
        return 'text-lg px-4 py-3';
      default:
        return 'text-base px-3 py-2';
    }
  };

  return (
    <nav aria-label="Breadcrumb">
      <ol className={`flex items-center space-x-2 ${getVariantClass(variant)} ${getSizeClass(size)} rounded-lg shadow-sm transition-all duration-200`}>
        {children}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

export const __demo = () => (
  <div>
    <Breadcrumbs variant="primary" size="sm">
      <li>
        <a href="#" className="text-white hover:text-opacity-70">Home</a>
      </li>
      <li>
        <span className="text-white opacity-70">/</span>
      </li>
      <li>
        <a href="#" className="text-white hover:text-opacity-70">Catalog</a>
      </li>
      <li>
        <span className="text-white opacity-70">/</span>
      </li>
      <li>
        <a href="#" className="text-white hover:text-opacity-70">Product</a>
      </li>
    </Breadcrumbs>
    <Breadcrumbs variant="neutral" size="md">
      <li>
        <a href="#" className="text-slate-700 hover:text-opacity-70">Home</a>
      </li>
      <li>
        <span className="text-slate-700 opacity-70">/</span>
      </li>
      <li>
        <a href="#" className="text-slate-700 hover:text-opacity-70">Catalog</a>
      </li>
      <li>
        <span className="text-slate-700 opacity-70">/</span>
      </li>
      <li>
        <a href="#" className="text-slate-700 hover:text-opacity-70">Product</a>
      </li>
    </Breadcrumbs>
    <Breadcrumbs variant="danger" size="lg">
      <li>
        <a href="#" className="text-white hover:text-opacity-70">Home</a>
      </li>
      <li>
        <span className="text-white opacity-70">/</span>
      </li>
      <li>
        <a href="#" className="text-white hover:text-opacity-70">Catalog</a>
      </li>
      <li>
        <span className="text-white opacity-70">/</span>
      </li>
      <li>
        <a href="#" className="text-white hover:text-opacity-70">Product</a>
      </li>
    </Breadcrumbs>
  </div>
);