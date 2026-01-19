import { useToastStore } from '../../store/toastStore';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function ToastContainer() {
    const { toasts, removeToast } = useToastStore();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto min-w-[300px] max-w-md p-4 rounded-xl shadow-lg border backdrop-blur-md animate-in slide-in-from-right-full transition-all duration-300 ${toast.type === 'success'
                            ? 'bg-green-500/10 border-green-500/20 text-green-500'
                            : toast.type === 'error'
                                ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                        }`}
                >
                    <div className="flex items-start gap-3">
                        {toast.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
                        {toast.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                        {toast.type === 'info' && <Info className="w-5 h-5 flex-shrink-0" />}

                        <div className="flex-1">
                            <p className="text-sm font-medium">{toast.message}</p>
                        </div>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-current opacity-70 hover:opacity-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
