"use client";
import { Provider } from "react-redux";
import { useRef, useEffect } from "react";
import { makeStore, getStoredState, type AppStore } from "@/redux/store";
import { ToastProvider } from "@/components/common/ToastContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  const ref = useRef<AppStore | null>(null);
  if (!ref.current) ref.current = makeStore();

  useEffect(() => {
    if (ref.current) {
      const storedState = getStoredState();
      if (Object.keys(storedState).length > 0) {
        ref.current.dispatch({ type: "REHYDRATE_STORE", payload: storedState });
      }
    }
  }, []);

  return (
    <Provider store={ref.current}>
      <ToastProvider>{children}</ToastProvider>
    </Provider>
  );
}
