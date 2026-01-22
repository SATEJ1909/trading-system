import { ReactNode } from 'react';

interface SkeletonLoaderProps {
    variant?: 'card' | 'table-row' | 'chart' | 'list' | 'text';
    count?: number;
    className?: string;
}

export default function SkeletonLoader({ variant = 'card', count = 1, className = '' }: SkeletonLoaderProps) {
    const skeletons = Array.from({ length: count }, (_, i) => i);

    if (variant === 'card') {
        return (
            <>
                {skeletons.map((i) => (
                    <div key={i} className={`bg-card rounded-2xl border border-border p-6 ${className}`}>
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="h-8 bg-muted rounded w-1/2"></div>
                            <div className="space-y-2">
                                <div className="h-3 bg-muted rounded"></div>
                                <div className="h-3 bg-muted rounded w-5/6"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </>
        );
    }

    if (variant === 'table-row') {
        return (
            <>
                {skeletons.map((i) => (
                    <div key={i} className={`flex items-center justify-between p-4 ${className}`}>
                        <div className="flex items-center gap-3 flex-1 animate-pulse">
                            <div className="w-10 h-10 bg-muted rounded-full"></div>
                            <div className="space-y-2 flex-1">
                                <div className="h-4 bg-muted rounded w-1/3"></div>
                                <div className="h-3 bg-muted rounded w-1/4"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 animate-pulse">
                            <div className="h-4 bg-muted rounded w-20"></div>
                            <div className="h-3 bg-muted rounded w-16"></div>
                        </div>
                    </div>
                ))}
            </>
        );
    }

    if (variant === 'chart') {
        return (
            <div className={`bg-card rounded-2xl border border-border p-6 ${className}`}>
                <div className="animate-pulse space-y-4">
                    <div className="h-5 bg-muted rounded w-1/4"></div>
                    <div className="h-64 bg-muted rounded"></div>
                    <div className="flex justify-between">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-3 bg-muted rounded w-12"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (variant === 'list') {
        return (
            <div className={`space-y-3 ${className}`}>
                {skeletons.map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (variant === 'text') {
        return (
            <div className={`space-y-2 ${className}`}>
                {skeletons.map((i) => (
                    <div key={i} className="h-4 bg-muted rounded animate-pulse"></div>
                ))}
            </div>
        );
    }

    return null;
}
