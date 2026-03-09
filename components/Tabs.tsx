import React from 'react';

interface TabsProps {
  variant: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ variant, size = 'medium', children }) => {
  const getColor = (variant: TabsProps['variant']) => {
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

  const getSize = (size: TabsProps['size']) => {
    switch (size) {
      case 'small':
        return 'px-2 py-1';
      case 'large':
        return 'px-4 py-2';
      default:
        return 'px-3 py-1.5';
    }
  };

  return (
    <div
      className={`rounded-lg shadow-sm transition-all duration-200 ${getColor(variant)} ${getSize(size)}`}
      role="tablist"
    >
      {children}
    </div>
  );
};

const __demo = () => (
  <div>
    <Tabs variant="primary" size="small">
      Primary Tab
    </Tabs>
    <Tabs variant="neutral" size="medium">
      Neutral Tab
    </Tabs>
    <Tabs variant="danger" size="large">
      Danger Tab
    </Tabs>
  </div>
);

export default Tabs;
export { __demo };