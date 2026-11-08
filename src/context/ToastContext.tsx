"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "success" | "error";

type ToastItem = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ToastContextValue = {
  showToast: (message: string, kind?: ToastKind) => void;
};

// Thông báo tự tắt sau 3,5 giây.
const TOAST_DURATION = 3500;

const toastStyle: Record<ToastKind, string> = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-700",
};

const ToastContext = createContext<ToastContextValue | null>(null);

let nextToastId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, kind: ToastKind = "success") => {
      const id = nextToastId;

      nextToastId += 1;
      setToasts((current) => [...current, { id, kind, message }]);
      window.setTimeout(() => dismiss(id), TOAST_DURATION);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.kind === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-card ${toastStyle[toast.kind]}`}
          >
            <span>{toast.message}</span>
            <button
              type="button"
              aria-label="Đóng thông báo"
              onClick={() => dismiss(toast.id)}
              className="shrink-0 leading-none opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast phải nằm trong ToastProvider.");
  }

  return context;
}
