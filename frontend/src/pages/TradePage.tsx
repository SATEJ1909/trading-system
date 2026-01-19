import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useMarketStore } from '../store/marketStore';
import { useToastStore } from '../store/toastStore';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import OrderBook from '../components/trading/OrderBook';
import OrderForm from '../components/trading/OrderForm';
import CryptoMarketChart from '@/components/ui/crypto-market-chart';
import {
    Wifi,
    WifiOff,
    Loader2,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Gift,
} from 'lucide-react';
import type { Asset } from '../types';
import api from '../api/axios';

// CoinGecko ID mapping for common cryptocurrencies
const COINGECKO_IDS: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'BNB': 'binancecoin',
    'XRP': 'ripple',
    'ADA': 'cardano',
    'SOL': 'solana',
    'DOGE': 'dogecoin',
    'DOT': 'polkadot',
    'MATIC': 'matic-network',
    'SHIB': 'shiba-inu',
    'LTC': 'litecoin',
    'TRX': 'tron',
    'AVAX': 'avalanche-2',
    'LINK': 'chainlink',
    'ATOM': 'cosmos',
    'UNI': 'uniswap',
    'XLM': 'stellar',
    'ALGO': 'algorand',
    'VET': 'vechain',
    'FIL': 'filecoin',
    'APT': 'aptos',
    'NEAR': 'near',
    'ARB': 'arbitrum',
    'OP': 'optimism',
    'INJ': 'injective-protocol',
};

// Get CoinGecko ID from symbol
const getCoinGeckoId = (symbol: string): string => {
    const upperSymbol = symbol?.toUpperCase() || 'BTC';
    return COINGECKO_IDS[upperSymbol] || symbol?.toLowerCase() || 'bitcoin';
};

export default function TradePage() {
    const { symbol } = useParams<{ symbol: string }>();
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const {
        connect,
        disconnect,
        subscribeToMarket,
        unsubscribeFromMarket,
        isConnected,
        userOrders,
        error,
        setError,
    } = useMarketStore();
    const addToast = useToastStore((state) => state.addToast);

    const [asset, setAsset] = useState<Asset | null>(null);
    const [isLoadingAsset, setIsLoadingAsset] = useState(true);
    const [assetNotInBackend, setAssetNotInBackend] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [userHolding, setUserHolding] = useState<number | null>(null);

    // Claim virtual assets for testing
    const handleClaimAssets = async () => {
        if (!asset?._id) return;

        try {
            setIsClaiming(true);
            const response = await api.post('/wallet/airdrop', {
                assetId: asset._id,
                quantity: 10 // Claim 10 units
            });

            if (response.data.success) {
                addToast(`Claimed 10 ${asset.symbol}! You can now place SELL orders.`, 'success');
                setUserHolding(response.data.data.availableQuantity);
            }
        } catch (err: any) {
            addToast(err.response?.data?.message || 'Failed to claim assets', 'error');
        } finally {
            setIsClaiming(false);
        }
    };

    // Fetch portfolio to show holdings
    useEffect(() => {
        const fetchPortfolio = async () => {
            if (!asset?._id) return;
            try {
                const response = await api.get('/wallet/portfolio');
                if (response.data.success && response.data.data) {
                    const holding = response.data.data.find(
                        (p: any) => p.assetId?._id === asset._id || p.assetId === asset._id
                    );
                    if (holding) {
                        setUserHolding(holding.availableQuantity);
                    }
                }
            } catch (err) {
                console.log('Could not fetch portfolio');
            }
        };
        fetchPortfolio();
    }, [asset?._id]);

    // Fetch asset details by symbol
    useEffect(() => {
        const fetchOrCreateAsset = async () => {
            if (!symbol) return;

            try {
                setIsLoadingAsset(true);
                setAssetNotInBackend(false);

                // Format the name from symbol (e.g., "btc" -> "Bitcoin")
                const formattedName = symbol.charAt(0).toUpperCase() + symbol.slice(1);

                // Auto-create asset if not exists using POST
                const response = await api.post(`/assets/symbol/${symbol.toUpperCase()}`, {
                    name: formattedName
                });

                if (response.data.success && response.data.data) {
                    setAsset(response.data.data);
                    console.log('[TradePage] Asset loaded/created:', response.data.data);
                } else {
                    throw new Error('Failed to load asset');
                }
            } catch (err) {
                console.error('Failed to fetch/create asset:', err);
                setError('Failed to load asset. Please try again.');
                // Create a fallback display asset
                setAssetNotInBackend(true);
                setAsset({
                    _id: symbol,
                    symbol: symbol.toUpperCase(),
                    name: symbol.charAt(0).toUpperCase() + symbol.slice(1),
                    source: 'COINGECKO',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                });
            } finally {
                setIsLoadingAsset(false);
            }
        };

        fetchOrCreateAsset();
    }, [symbol, setError]);

    // Connect to socket when token is available
    useEffect(() => {
        if (token) {
            connect(token);
        }

        return () => {
            unsubscribeFromMarket();
        };
    }, [token, connect, unsubscribeFromMarket]);

    // Subscribe to market when connected and asset is loaded
    useEffect(() => {
        if (isConnected && asset?._id) {
            subscribeToMarket(asset._id);
        }
    }, [isConnected, asset?._id, subscribeToMarket]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'FILLED':
                return <CheckCircle className="w-4 h-4 text-primary" />;
            case 'CANCELLED':
                return <XCircle className="w-4 h-4 text-destructive" />;
            case 'PARTIAL':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            default:
                return <Clock className="w-4 h-4 text-muted-foreground" />;
        }
    };

    const formatPrice = (price: number | null) => {
        if (price === null) return 'Market';
        return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    if (!symbol) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-foreground mb-2">Invalid Asset</h2>
                    <p className="text-muted-foreground mb-4">No asset symbol provided</p>
                    <Button onClick={() => navigate('/markets')}>Go to Markets</Button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <Navbar />

            {/* Connection Status Bar */}
            <div className="fixed top-16 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                        {isLoadingAsset ? 'Loading...' : `Trading ${asset?.symbol || symbol?.toUpperCase()}`}
                    </span>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${isConnected
                        ? 'bg-primary/10 text-primary'
                        : 'bg-destructive/10 text-destructive'
                        }`}>
                        {isConnected ? (
                            <>
                                <Wifi className="w-3 h-3" />
                                <span>Live</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="w-3 h-3" />
                                <span>Offline</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Asset Info Header */}
                    {!isLoadingAsset && asset && (
                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                                    Trade {asset.name}
                                </h1>
                                <p className="text-muted-foreground">
                                    {asset.symbol} • Real-time order book
                                    {userHolding !== null && (
                                        <span className="ml-3 text-primary font-medium">
                                            Your Holdings: {userHolding.toFixed(4)} {asset.symbol}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <Button
                                onClick={handleClaimAssets}
                                disabled={isClaiming || assetNotInBackend}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                            >
                                {isClaiming ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Claiming...
                                    </>
                                ) : (
                                    <>
                                        <Gift className="w-4 h-4 mr-2" />
                                        Claim 10 {asset.symbol}
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {isLoadingAsset ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Asset Not In Backend Warning */}
                            {assetNotInBackend && (
                                <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-6">
                                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                    <div className="text-sm">
                                        <p className="text-yellow-500 font-medium">Asset not registered for trading</p>
                                        <p className="text-muted-foreground">This asset ({symbol?.toUpperCase()}) needs to be added to the trading system before you can place orders.</p>
                                    </div>
                                </div>
                            )}

                            {/* Error Banner */}
                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl mb-6">
                                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                                    <p className="text-destructive text-sm">{error}</p>
                                    <button
                                        onClick={() => setError(null)}
                                        className="ml-auto text-destructive hover:text-destructive/80"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Price Chart */}
                            <div className="mb-6">
                                <CryptoMarketChart
                                    coinId={getCoinGeckoId(asset?.symbol || symbol || 'BTC')}
                                    symbol={asset?.symbol || symbol?.toUpperCase() || 'BTC'}
                                    name={asset?.name || symbol || 'Bitcoin'}
                                    onBuy={() => {
                                        const orderForm = document.getElementById('order-form');
                                        orderForm?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    onSell={() => {
                                        const orderForm = document.getElementById('order-form');
                                        orderForm?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    onTrade={() => {
                                        const orderForm = document.getElementById('order-form');
                                        orderForm?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                />
                            </div>

                            {/* Trading Interface */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="order-form">
                                {/* Order Book */}
                                <div className="lg:col-span-2">
                                    <OrderBook />
                                </div>

                                {/* Order Form */}
                                <div>
                                    <OrderForm
                                        assetId={asset?._id || symbol}
                                        assetSymbol={asset?.symbol || 'ASSET'}
                                        isDisabled={assetNotInBackend}
                                    />
                                </div>
                            </div>

                            {/* User Orders */}
                            <div className="mt-8">
                                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                                    <div className="px-4 py-3 border-b border-border">
                                        <h3 className="text-lg font-semibold text-foreground">
                                            My Orders
                                        </h3>
                                    </div>

                                    {userOrders.length === 0 ? (
                                        <div className="px-4 py-12 text-center">
                                            <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                                            <p className="text-muted-foreground">
                                                No orders yet. Place your first order above!
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border">
                                            {/* Header */}
                                            <div className="hidden md:grid grid-cols-6 gap-4 px-4 py-2 bg-secondary/30 text-xs font-medium text-muted-foreground">
                                                <span>Side</span>
                                                <span>Type</span>
                                                <span>Price</span>
                                                <span>Quantity</span>
                                                <span>Filled</span>
                                                <span>Status</span>
                                            </div>

                                            {userOrders.map((order) => (
                                                <div
                                                    key={order.id}
                                                    className="grid grid-cols-2 md:grid-cols-6 gap-4 px-4 py-3 hover:bg-secondary/20 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-medium ${order.side === 'BUY'
                                                            ? 'text-primary'
                                                            : 'text-destructive'
                                                            }`}>
                                                            {order.side || 'BUY'}
                                                        </span>
                                                    </div>
                                                    <span className="text-muted-foreground text-sm">
                                                        {order.orderType || 'LIMIT'}
                                                    </span>
                                                    <span className="text-foreground">
                                                        {formatPrice(order.price)}
                                                    </span>
                                                    <span className="text-foreground">
                                                        {(order.quantity ?? 0).toFixed(4)}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {(order.filledQuantity ?? 0).toFixed(4)}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(order.status || 'OPEN')}
                                                        <span className="text-sm capitalize">
                                                            {(order.status || 'OPEN').toLowerCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}
