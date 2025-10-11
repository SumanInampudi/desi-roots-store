import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, duration = 2000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[60] animate-slide-down">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 min-w-[300px] max-w-md">
        <CheckCircle className="w-6 h-6 flex-shrink-0 animate-scale-in" />
        <p className="font-semibold flex-1">{message}</p>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;

