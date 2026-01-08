
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error') => void;
}

const ToastsContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const value = useMemo(() => ({ toasts, addToast }), [toasts, addToast]);

  return React.createElement(ToastsContext.Provider, { value }, children);
};

export function useToasts() {
  const ctx = useContext(ToastsContext);
  if (!ctx) {
    throw new Error('useToasts must be used within a ToastProvider');
  }
  return ctx;
}
