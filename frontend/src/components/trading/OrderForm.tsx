import { useState, useEffect, useMemo } from 'react';
import { useMarketStore } from '../../store/marketStore';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import type { OrderSide, OrderType } from '../../types';

interface OrderFormProps {
    assetId: string;
    assetSymbol: string;
    className?: string;
    isDisabled?: boolean;
}

export default function OrderForm({ assetId, assetSymbol, className = '', isDisabled = false }: OrderFormProps) {
    const { placeOrder, isLoading, error, setError, orderBook } = useMarketStore();

    const [side, setSide] = useState<OrderSide>('BUY');
    const [orderType, setOrderType] = useState<OrderType>('LIMIT');
    const [price, setPrice] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('');

    // Get best prices from order book for reference
    const bestAsk = orderBook.asks[0]?.price || 0;
    const bestBid = orderBook.bids[0]?.price || 0;

    // Auto-fill price with best bid/ask when switching sides
    useEffect(() => {
        if (orderType === 'LIMIT') {
            if (side === 'BUY' && bestAsk > 0) {
                setPrice(bestAsk.toString());
            } else if (side === 'SELL' && bestBid > 0) {
                setPrice(bestBid.toString());
            }
        }
    }, [side, bestAsk, bestBid, orderType]);

    // Clear error on input change
    useEffect(() => {
        setError(null);
    }, [side, orderType, price, quantity, setError]);

    // Calculate total
    const total = useMemo(() => {
        const p = parseFloat(price) || 0;
        const q = parseFloat(quantity) || 0;
        return p * q;
    }, [price, quantity]);

    const formatPrice = (value: number) => {
        return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const qty = parseFloat(quantity);
        const prc = orderType === 'MARKET' ? null : parseFloat(price);

        if (!qty || qty <= 0) {
            setError('Please enter a valid quantity');
            return;
        }

        if (orderType === 'LIMIT' && (!prc || prc <= 0)) {
            setError('Please enter a valid price for limit orders');
            return;
        }

        placeOrder({
            assetId,
            side,
            orderType,
            quantity: qty,
            price: prc,
        });

        // Clear form on submit
        setQuantity('');
    };

    return (
        <div className={`glass-card rounded-2xl border border-border overflow-hidden ${className}`}>
            {/* Side Toggle */}
            <div className="grid grid-cols-2">
                <button
                    type="button"
                    onClick={() => setSide('BUY')}
                    className={`py-4 text-sm font-semibold transition-all duration-300 ${side === 'BUY'
                        ? 'btn-glow-green text-white'
                        : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                        }`}
                >
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    BUY
                </button>
                <button
                    type="button"
                    onClick={() => setSide('SELL')}
                    className={`py-4 text-sm font-semibold transition-all duration-300 ${side === 'SELL'
                        ? 'btn-glow-red text-white'
                        : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                        }`}
                >
                    <TrendingDown className="w-4 h-4 inline mr-2" />
                    SELL
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Order Type */}
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Order Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setOrderType('LIMIT')}
                            className={`py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${orderType === 'LIMIT'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border text-muted-foreground hover:border-primary/50'
                                }`}
                        >
                            Limit
                        </button>
                        <button
                            type="button"
                            onClick={() => setOrderType('MARKET')}
                            className={`py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${orderType === 'MARKET'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border text-muted-foreground hover:border-primary/50'
                                }`}
                        >
                            Market
                        </button>
                    </div>
                </div>

                {/* Price Input */}
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Price (INR)
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            ₹
                        </span>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={orderType === 'MARKET' ? '' : price}
                            onChange={(e) => setPrice(e.target.value)}
                            disabled={orderType === 'MARKET' || isDisabled}
                            placeholder={orderType === 'MARKET' ? 'Market Price' : 'Enter price'}
                            className="w-full pl-8 pr-4 py-3 bg-secondary/30 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                    {orderType === 'LIMIT' && (
                        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                            <span>Best Bid: {formatPrice(bestBid)}</span>
                            <span>Best Ask: {formatPrice(bestAsk)}</span>
                        </div>
                    )}
                </div>

                {/* Quantity Input */}
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Quantity ({assetSymbol})
                    </label>
                    <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Enter quantity"
                        disabled={isDisabled}
                        className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                {/* Total */}
                {orderType === 'LIMIT' && (
                    <div className="bg-secondary/30 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total</span>
                            <span className="text-lg font-semibold text-foreground">
                                {formatPrice(total)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isLoading || !quantity || isDisabled}
                    className={`w-full py-3 text-base font-semibold ${side === 'BUY'
                        ? 'bg-primary hover:bg-primary/90'
                        : 'bg-destructive hover:bg-destructive/90'
                        }`}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            {side === 'BUY' ? (
                                <TrendingUp className="w-4 h-4 mr-2" />
                            ) : (
                                <TrendingDown className="w-4 h-4 mr-2" />
                            )}
                            {side === 'BUY' ? 'Buy' : 'Sell'} {assetSymbol}
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
}
