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
        return 'px-2 py-1 text-xs';
      case 'large':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  return (
    <div
      className={`rounded-lg shadow-sm transition-all duration-200 ${getColor(variant)} ${getSize(size)}`}
      role="tablist"
      aria-roledescription="Tabs navigation"
    >
      {children}
    </div>
  );
};

const __demo = () => (
  <div>
    <Tabs variant="primary" size="small" role="tab" aria-selected="true" tabIndex={0} onKeyDown={() => {}}>
      Primary Tab
    </Tabs>
    <Tabs variant="neutral" size="medium" role="tab" aria-selected="false" tabIndex={-1} onKeyDown={() => {}}>
      Neutral Tab
    </Tabs>
    <Tabs variant="danger" size="large" role="tab" aria-selected="false" tabIndex={-1} onKeyDown={() => {}}>
      Danger Tab
    </Tabs>
  </div>
);

export default Tabs;
export { __demo };