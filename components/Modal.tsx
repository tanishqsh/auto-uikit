import React from 'react';

interface ModalProps {
  variant?: 'primary' | 'neutral' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ variant = 'primary', size = 'medium', children }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 rounded-lg shadow-sm transition-all duration-200 ${
        variant === 'primary' ? 'bg-blue-500 text-white' : ''
      } ${
        variant === 'neutral' ? 'bg-slate-500 text-white' : ''
      } ${
        variant === 'danger' ? 'bg-red-500 text-white' : ''
      } ${
        variant === 'success' ? 'bg-green-500 text-white' : ''
      } ${
        size === 'small' ? 'w-96 h-48' : ''
      } ${
        size === 'medium' ? 'w-112 h-64' : ''
      } ${
        size === 'large' ? 'w-128 h-96' : ''
      }`}
    >
      {children}
    </div>
  );
};

export default Modal;

export const __demo: React.FC = () => (
  <div className="flex flex-col gap-4">
    <Modal variant="primary" size="small">
      Primary Small
    </Modal>
    <Modal variant="neutral" size="medium">
      Neutral Medium
    </Modal>
    <Modal variant="danger" size="large">
      Danger Large
    </Modal>
  </div>
);