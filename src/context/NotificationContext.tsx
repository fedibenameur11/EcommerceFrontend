import { createContext, useContext, useCallback, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, TriangleAlert, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

interface Toast {
  id: number;
  message: string;
  type: NotificationType;
}

const DURATION_MS = 3500;

const styles: Record<NotificationType, { icon: typeof Info; accent: string; bar: string }> = {
  success: { icon: CheckCircle2, accent: 'text-emerald-600 bg-emerald-50', bar: 'bg-emerald-500' },
  error: { icon: AlertCircle, accent: 'text-red-600 bg-red-50', bar: 'bg-red-500' },
  info: { icon: Info, accent: 'text-sky-600 bg-sky-50', bar: 'bg-sky-500' },
  warning: { icon: TriangleAlert, accent: 'text-amber-600 bg-amber-50', bar: 'bg-amber-500' },
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const showNotification = useCallback(
    (message: string, type: NotificationType = 'info') => {
      const id = nextId.current++;
      // On garde au plus 4 toasts à l'écran
      setToasts((current) => [...current.slice(-3), { id, message, type }]);
      window.setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ showNotification }), [showNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:bottom-6 sm:right-6"
      >
        {toasts.map((toast) => {
          const { icon: Icon, accent, bar } = styles[toast.type];
          return (
            <div
              key={toast.id}
              role={toast.type === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto relative animate-toast-in overflow-hidden rounded-xl border bg-background shadow-xl"
            >
              <div className="flex items-start gap-3 p-4">
                <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', accent)}>
                  <Icon className="h-4 w-4" />
                </span>
                <p className="flex-1 pt-1 text-sm font-medium">{toast.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  aria-label="Fermer"
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div
                className={cn('h-1 origin-left animate-toast-progress', bar)}
                style={{ animationDuration: `${DURATION_MS}ms` }}
              />
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export default NotificationContext;
