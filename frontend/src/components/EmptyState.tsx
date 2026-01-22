import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export default function EmptyState({ icon: Icon, title, description, action, className = '' }: EmptyStateProps) {
    return (
        <div className={`text-center py-16 px-4 ${className}`}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-muted/30 rounded-full mb-6">
                <Icon className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">{description}</p>
            {action && (
                <Button onClick={action.onClick} className="bg-gradient-primary text-white hover:opacity-90 transition-opacity">
                    {action.label}
                </Button>
            )}
        </div>
    );
}
