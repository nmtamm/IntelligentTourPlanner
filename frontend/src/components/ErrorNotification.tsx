import { AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';

interface ErrorNotificationProps {
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function ErrorNotification({ 
  message, 
  onClose, 
  autoClose = true, 
  duration = 4000 
}: ErrorNotificationProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
      <div className="bg-white border-l-4 border-red-500 rounded-lg shadow-lg p-4 flex items-start gap-3 max-w-md">
        <div className="flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 break-words">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
