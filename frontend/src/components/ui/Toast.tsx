import { useContext, useState, useCallback, type ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { ToastContext, type Toast, type ToastType } from './ToastContext';

export { type ToastType, type Toast };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType, title?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message: string, title?: string) => {
    addToast(message, 'success', title);
  }, [addToast]);

  const error = useCallback((message: string, title?: string) => {
    addToast(message, 'error', title);
  }, [addToast]);

  const warning = useCallback((message: string, title?: string) => {
    addToast(message, 'warning', title);
  }, [addToast]);

  const info = useCallback((message: string, title?: string) => {
    addToast(message, 'info', title);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('ToastContainer must be used within ToastProvider');
  }
  const { toasts, removeToast } = context;

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[toast.type];

  return (
    <div className={`toast toast-${toast.type}`} role="alert">
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {toast.title && <h4 className="font-semibold text-sm">{toast.title}</h4>}
        <p className="text-sm">{toast.message}</p>
      </div>
      <button
        onClick={onRemove}
        className="p-1 hover:bg-black/5 transition-colors flex-shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
