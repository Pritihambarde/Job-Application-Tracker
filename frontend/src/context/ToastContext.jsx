import { useState, useCallback, useRef } from 'react';
import { ToastContext } from './toast-context-instance';

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    const timer = setTimeout(() => dismiss(id), duration);
    timers.current.set(id, timer);
    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} onClick={() => dismiss(t.id)}>
            <span className="toast-icon">
              {t.type === 'success' ? '✓' : t.type === 'error' ? '!' : 'i'}
            </span>
            <span className="toast-message">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
