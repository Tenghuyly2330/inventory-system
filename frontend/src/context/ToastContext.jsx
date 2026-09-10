import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
      const [toasts, setToasts] = useState([]);

      const addToast = useCallback((message, type = "info") => {
            const id = Date.now() + Math.random().toString();
            setToasts((prev) => [...prev, { id, message, type }]);

            setTimeout(() => {
                  setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 4000);
      }, []);

      const removeToast = useCallback((id) => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
      }, []);

      const toast = {
            success: (msg) => addToast(msg, "success"),
            error: (msg) => addToast(msg, "error"),
            info: (msg) => addToast(msg, "info")
      };

      return (
            <ToastContext.Provider value={toast}>
                  {children}
                  <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
                        {toasts.map((t) => (
                              <div
                                    key={t.id}
                                    className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-bottom-5 fade-in duration-300 ${t.type === "success"
                                                ? "bg-slate-900/95 border-emerald-500/40 text-emerald-600 shadow-emerald-500/10"
                                                : t.type === "error"
                                                      ? "bg-slate-900/95 border-rose-500/40 text-rose-600 shadow-rose-500/10"
                                                      : "bg-slate-900/95 border-indigo-500/40 text-indigo-600 shadow-indigo-500/10"
                                          }`}
                              >
                                    <div className="flex items-center gap-3">
                                          {t.type === "success" && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />}
                                          {t.type === "error" && <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />}
                                          {t.type === "info" && <Info className="w-5 h-5 shrink-0 text-indigo-600" />}
                                          <p className="text-xs font-semibold text-slate-100">{t.message}</p>
                                    </div>
                                    <button
                                          onClick={() => removeToast(t.id)}
                                          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors shrink-0"
                                    >
                                          <X className="w-4 h-4" />
                                    </button>
                              </div>
                        ))}
                  </div>
            </ToastContext.Provider>
      );
};

export const useToast = () => {
      const context = useContext(ToastContext);
      if (!context) {
            throw new Error("useToast must be used within a ToastProvider");
      }
      return context;
};
