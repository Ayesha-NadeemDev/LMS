"use client";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-6 right-6 z-[100] space-y-2">
        {toasts.map((t) => (
          <div key={t.id}
            className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl px-4 py-3 min-w-[280px] animate-slide-up">
            {icons[t.type]}
            <p className="text-sm font-medium flex-1">{t.message}</p>
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}>
              <X size={16} className="text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);