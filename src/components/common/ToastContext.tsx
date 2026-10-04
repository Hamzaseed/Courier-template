"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { LuCircleCheck, LuCircleAlert, LuX } from "react-icons/lu";

export type ToastType = "success" | "info" | "warning" | "error" | "danger";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => {
          const isCancelOrError =
            toast.type === "error" ||
            toast.type === "danger" ||
            toast.message.toLowerCase().includes("cancel") ||
            toast.message.toLowerCase().includes("fail") ||
            toast.message.toLowerCase().includes("delete");

          const borderColor = isCancelOrError
            ? "#EF4444"
            : "#1E3147";

          return (
            <div
              key={toast.id}
              className={`toast-item toast-${toast.type}`}
              style={{ borderLeftColor: borderColor }}
            >
              <div className="toast-icon">
                {isCancelOrError ? (
                  <LuCircleAlert size={20} color="#EF4444" />
                ) : (
                  <LuCircleCheck size={20} color="#1E3147" />
                )}
              </div>
              <div className="toast-content">
                <strong>{isCancelOrError ? "Action Notice" : "Status Updated"}</strong>
                <p>{toast.message}</p>
              </div>
              <button
                className="toast-close"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss toast"
              >
                <LuX size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
