import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[150] space-y-2 max-w-sm w-full pointer-events-none font-republic">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-200 ${
              isSuccess
                ? 'bg-[#08120d]/95 border-[#10b981]/30 text-gray-200'
                : isError
                ? 'bg-[#14080a]/95 border-[#f43f5e]/30 text-gray-200'
                : 'bg-[#0e0e12]/95 border-[#222228] text-gray-200'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#10b981]" />}
              {isError && <AlertCircle className="w-4 h-4 text-[#f43f5e]" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-white" />}
            </div>

            <div className="flex-1">
              <div className="text-xs font-bold text-white font-republic-display leading-tight">{toast.title}</div>
              <div className="text-[11px] text-gray-300 mt-1 leading-snug">{toast.message}</div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-gray-400 hover:text-white shrink-0 -mr-1 -mt-1 p-1 rounded-md hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
