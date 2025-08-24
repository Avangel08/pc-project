'use client';

import { useToast } from '@/hooks/use-toast';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="max-w-[260px] p-3 text-xs">
            <div className="grid gap-1 text-center">
              {title && <ToastTitle className="text-xs font-semibold">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="flex flex-col items-center justify-center gap-1 text-[11px]">
                  {typeof description === 'string' ? (
                    description
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      {description}
                      <style jsx>{`
                        .toast-gif {
                          border-radius: 8px;
                          box-shadow: 0 1px 6px rgba(0,0,0,0.13);
                          margin-top: 4px;
                          max-width: 56px;
                          transition: transform 0.2s;
                        }
                        .toast-gif:hover {
                          transform: scale(1.08) rotate(-2deg);
                        }
                      `}</style>
                    </div>
                  )}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-[100]" />
    </ToastProvider>
  );
}
