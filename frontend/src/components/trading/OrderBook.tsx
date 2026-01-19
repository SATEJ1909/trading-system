import { useMemo } from 'react';
import { useMarketStore } from '../../store/marketStore';
import { Loader2 } from 'lucide-react';

interface OrderBookProps {
    className?: string;
}

export default function OrderBook({ className = '' }: OrderBookProps) {
    const { orderBook, isLoading } = useMarketStore();

    // Calculate max quantity for depth visualization
    const maxBidQty = useMemo(
        () => Math.max(0, ...orderBook.bids.map((b) => (b.quantity ?? 0) - (b.filledQuantity ?? 0)), 1),
        [orderBook.bids]
    );
    const maxAskQty = useMemo(
        () => Math.max(0, ...orderBook.asks.map((a) => (a.quantity ?? 0) - (a.filledQuantity ?? 0)), 1),
        [orderBook.asks]
    );

    // Calculate spread
    const spread = useMemo(() => {
        const lowestAsk = orderBook.asks[0]?.price || 0;
        const highestBid = orderBook.bids[0]?.price || 0;
        if (lowestAsk && highestBid) {
            return lowestAsk - highestBid;
        }
        return 0;
    }, [orderBook.asks, orderBook.bids]);

    const formatPrice = (price: number) => {
        return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatQty = (qty: number) => {
        return qty.toFixed(4);
    };

    if (isLoading) {
        return (
            <div className={`bg-card rounded-2xl border border-border p-6 ${className}`}>
                <h3 className="text-lg font-semibold text-foreground mb-4">Order Book</h3>
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-card rounded-2xl border border-border overflow-hidden ${className}`}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Order Book</h3>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-3 gap-2 px-4 py-2 bg-secondary/30 text-xs font-medium text-muted-foreground">
                <span>Price (INR)</span>
                <span className="text-center">Quantity</span>
                <span className="text-right">Total</span>
            </div>

            {/* Asks (Sell orders) - Red, sorted by price ascending (lowest first) */}
            <div className="max-h-[200px] overflow-y-auto">
                {orderBook.asks.length === 0 ? (
                    <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                        No sell orders
                    </div>
                ) : (
                    [...orderBook.asks].reverse().map((ask, index) => {
                        const remainingQty = (ask.quantity ?? 0) - (ask.filledQuantity ?? 0);
                        const total = (ask.price ?? 0) * remainingQty;
                        const depthPercent = (remainingQty / maxAskQty) * 100;

                        return (
                            <div
                                key={ask.id || index}
                                className="relative grid grid-cols-3 gap-2 px-4 py-1.5 text-sm hover:bg-secondary/20 transition-colors"
                            >
                                {/* Depth bar */}
                                <div
                                    className="absolute right-0 top-0 bottom-0 bg-destructive/10"
                                    style={{ width: `${depthPercent}%` }}
                                />
                                <span className="relative text-destructive font-medium">
                                    {formatPrice(ask.price ?? 0)}
                                </span>
                                <span className="relative text-center text-foreground">
                                    {formatQty(remainingQty)}
                                </span>
                                <span className="relative text-right text-muted-foreground">
                                    {formatPrice(total)}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Spread indicator */}
            <div className="px-4 py-2 bg-secondary/50 border-y border-border">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Spread</span>
                    <span className="font-medium text-foreground">{formatPrice(spread)}</span>
                </div>
            </div>

            {/* Bids (Buy orders) - Green, sorted by price descending (highest first) */}
            <div className="max-h-[200px] overflow-y-auto">
                {orderBook.bids.length === 0 ? (
                    <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                        No buy orders
                    </div>
                ) : (
                    orderBook.bids.map((bid, index) => {
                        const remainingQty = (bid.quantity ?? 0) - (bid.filledQuantity ?? 0);
                        const total = (bid.price ?? 0) * remainingQty;
                        const depthPercent = (remainingQty / maxBidQty) * 100;

                        return (
                            <div
                                key={bid.id || index}
                                className="relative grid grid-cols-3 gap-2 px-4 py-1.5 text-sm hover:bg-secondary/20 transition-colors"
                            >
                                {/* Depth bar */}
                                <div
                                    className="absolute right-0 top-0 bottom-0 bg-primary/10"
                                    style={{ width: `${depthPercent}%` }}
                                />
                                <span className="relative text-primary font-medium">
                                    {formatPrice(bid.price ?? 0)}
                                </span>
                                <span className="relative text-center text-foreground">
                                    {formatQty(remainingQty)}
                                </span>
                                <span className="relative text-right text-muted-foreground">
                                    {formatPrice(total)}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
