import React from 'react';

interface PaginationProps {
  variant?: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Pagination: React.FC<PaginationProps> = ({ variant = 'primary', size = 'md', children }) => {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'neutral':
        return 'bg-slate-200 hover:bg-slate-300 text-slate-900';
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'success':
        return 'bg-green-500 hover:bg-green-600 text-white';
      default:
        return 'bg-blue-500 hover:bg-blue-600 text-white';
    }
  };

  const getSizeClasses = (size: string) => {
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
    <nav aria-label="Pagination">
      <ul className="flex items-center justify-center gap-2">
        {React.Children.map(children, (child, index) => (
          <li key={index}>
            <button
              className={`flex items-center justify-center rounded-lg shadow-sm transition-all duration-200 ${getSizeClasses(size)} ${getVariantClasses(variant)} ${child.props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-disabled={child.props.disabled}
            >
              {child}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Pagination;

export const __demo = () => (
  <div>
    <h2>Primary</h2>
    <Pagination variant="primary">
      <button>Previous</button>
      <button>1</button>
      <button>2</button>
      <button>3</button>
      <button>4</button>
      <button>5</button>
      <button>Next</button>
    </Pagination>

    <h2>Neutral</h2>
    <Pagination variant="neutral">
      <button>Previous</button>
      <button>1</button>
      <button>2</button>
      <button>3</button>
      <button>4</button>
      <button>5</button>
      <button>Next</button>
    </Pagination>

    <h2>Danger</h2>
    <Pagination variant="danger">
      <button>Previous</button>
      <button>1</button>
      <button>2</button>
      <button>3</button>
      <button>4</button>
      <button>5</button>
      <button>Next</button>
    </Pagination>
  </div>
);