import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default'
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative glass-strong rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl animate-scale-in">
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${variant === 'destructive' ? 'bg-destructive/10' : 'bg-primary/10'
                        }`}>
                        <AlertTriangle className={`w-6 h-6 ${variant === 'destructive' ? 'text-destructive' : 'text-primary'
                            }`} />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{message}</p>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 ${variant === 'destructive'
                                ? 'bg-destructive text-white hover:bg-destructive/90'
                                : 'bg-gradient-primary text-white hover:opacity-90'
                            }`}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
