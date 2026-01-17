import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/components/ui/button';
import {
    TrendingUp,
    TrendingDown,
    Loader2,
    RefreshCw,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
} from 'lucide-react';

// Rate limiting and caching constants
const REFRESH_COOLDOWN_MS = 60000; // 60 seconds between manual refreshes
const AUTO_REFRESH_INTERVAL_MS = 120000; // 2 minutes for auto-refresh (safer for free API)
const CACHE_KEY = 'tradex_markets_cache';
const CACHE_EXPIRY_MS = 120000; // Cache valid for 2 minutes

interface CryptoAsset {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    price_change_percentage_24h: number;
    total_volume: number;
    high_24h: number;
    low_24h: number;
    image: string;
    market_cap_rank: number;
}

interface CacheData {
    data: CryptoAsset[];
    timestamp: number;
}

// Cache helper functions
const getCache = (): CacheData | null => {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;
        return JSON.parse(cached) as CacheData;
    } catch {
        return null;
    }
};

const setCache = (data: CryptoAsset[]) => {
    try {
        const cacheData: CacheData = { data, timestamp: Date.now() };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (e) {
        console.warn('Failed to cache market data:', e);
    }
};

const isCacheValid = (cache: CacheData | null): cache is CacheData => {
    if (!cache) return false;
    return Date.now() - cache.timestamp < CACHE_EXPIRY_MS;
};

export default function MarketsPage() {
    const { user, logout } = useAuthStore();
    const [assets, setAssets] = useState<CryptoAsset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [isCached, setIsCached] = useState(false);

    // Rate limiting state
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const lastFetchTime = useRef<number>(0);

    // Fetch top 25 cryptocurrencies from CoinGecko in INR
    const fetchMarkets = useCallback(async (isManualRefresh = false, forceRefresh = false) => {
        // Check cooldown for manual refreshes
        if (isManualRefresh) {
            const timeSinceLastFetch = Date.now() - lastFetchTime.current;
            if (timeSinceLastFetch < REFRESH_COOLDOWN_MS) {
                const remainingSeconds = Math.ceil((REFRESH_COOLDOWN_MS - timeSinceLastFetch) / 1000);
                setError(`Please wait ${remainingSeconds}s before refreshing again to avoid rate limits.`);
                return;
            }
        }

        // Check cache first (unless force refresh or manual refresh)
        if (!forceRefresh && !isManualRefresh) {
            const cache = getCache();
            if (isCacheValid(cache)) {
                setAssets(cache.data);
                setLastUpdated(new Date(cache.timestamp));
                setIsLoading(false);
                setIsCached(true);
                lastFetchTime.current = cache.timestamp;
                return;
            }
        }

        try {
            setIsLoading(true);
            setError(null);
            setIsCached(false);

            const response = await fetch(
                'https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=24h'
            );

            // Handle rate limit error specifically - fall back to cache
            if (response.status === 429) {
                const cache = getCache();
                if (cache) {
                    setAssets(cache.data);
                    setLastUpdated(new Date(cache.timestamp));
                    setIsCached(true);
                    setError('Rate limited - showing cached data. Will auto-refresh later.');
                } else {
                    setError('Rate limit exceeded. Please wait a moment before trying again.');
                }
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch market data');
            }

            const data: CryptoAsset[] = await response.json();
            setAssets(data);
            setLastUpdated(new Date());
            lastFetchTime.current = Date.now();

            // Save to cache
            setCache(data);

            // Start cooldown countdown for manual refresh button
            if (isManualRefresh) {
                setCooldownRemaining(REFRESH_COOLDOWN_MS / 1000);
            }
        } catch (err: any) {
            // On error, try to use cached data
            const cache = getCache();
            if (cache) {
                setAssets(cache.data);
                setLastUpdated(new Date(cache.timestamp));
                setIsCached(true);
                setError('Network error - showing cached data.');
            } else {
                setError(err.message || 'Failed to fetch market data');
            }
            console.error('Market fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Cooldown countdown timer
    useEffect(() => {
        if (cooldownRemaining > 0) {
            const timer = setTimeout(() => {
                setCooldownRemaining((prev) => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldownRemaining]);

    // Initial fetch
    useEffect(() => {
        fetchMarkets(false);
    }, [fetchMarkets]);

    // Auto-refresh prices every 2 minutes (safer interval)
    useEffect(() => {
        const interval = setInterval(() => {
            fetchMarkets(false);
        }, AUTO_REFRESH_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [fetchMarkets]);

    const handleBuy = (symbol: string) => {
        console.log(`Buy ${symbol}`);
        alert(`Buy order for ${symbol.toUpperCase()} - Trading coming soon!`);
    };

    const handleSell = (symbol: string) => {
        console.log(`Sell ${symbol}`);
        alert(`Sell order for ${symbol.toUpperCase()} - Trading coming soon!`);
    };

    // Format price in INR
    const formatPrice = (price: number) => {
        if (price >= 10000000) {
            return `₹${(price / 10000000).toFixed(2)} Cr`;
        }
        if (price >= 100000) {
            return `₹${(price / 100000).toFixed(2)} L`;
        }
        if (price >= 1000) {
            return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        if (price >= 1) {
            return `₹${price.toFixed(2)}`;
        }
        return `₹${price.toFixed(6)}`;
    };

    // Format volume in INR
    const formatVolume = (volume: number) => {
        if (volume >= 1e12) return `₹${(volume / 1e12).toFixed(2)}T`;
        if (volume >= 1e9) return `₹${(volume / 1e9).toFixed(2)}B`;
        if (volume >= 1e7) return `₹${(volume / 1e7).toFixed(2)}Cr`;
        if (volume >= 1e5) return `₹${(volume / 1e5).toFixed(2)}L`;
        return `₹${volume.toLocaleString('en-IN')}`;
    };

    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold text-foreground">TradeX</span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6">
                            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Dashboard
                            </Link>
                            <Link to="/markets" className="text-sm text-primary font-medium">
                                Markets
                            </Link>
                            <Link to="/wallet" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Wallet
                            </Link>
                        </nav>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground hidden sm:block">
                                {user?.name}
                            </span>
                            <Button
                                variant="ghost"
                                className="text-muted-foreground hover:text-foreground"
                                onClick={logout}
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                                Live Markets
                            </h1>
                            <p className="text-muted-foreground text-sm flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500' : isCached ? 'bg-orange-500' : 'bg-primary'} animate-pulse`} />
                                {isLoading ? 'Loading...' : `Top 25 Cryptocurrencies in INR`}
                                {isCached && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">Cached</span>}
                                • Updated: {lastUpdated.toLocaleTimeString()}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => fetchMarkets(true)}
                            disabled={isLoading || cooldownRemaining > 0}
                            className="border-border hover:bg-card"
                        >
                            {cooldownRemaining > 0 ? (
                                <>
                                    <Clock className="w-4 h-4 mr-2" />
                                    Wait {cooldownRemaining}s
                                </>
                            ) : (
                                <>
                                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl mb-6">
                            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                            <p className="text-destructive text-sm">{error}</p>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && assets.length === 0 ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : assets.length === 0 ? (
                        /* Empty State */
                        <div className="text-center py-20">
                            <TrendingUp className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground">No market data available</p>
                        </div>
                    ) : (
                        /* Assets Table */
                        <div className="bg-card rounded-2xl border border-border overflow-hidden">
                            {/* Table Header */}
                            <div className="hidden md:grid grid-cols-[0.5fr_2fr_1.5fr_1fr_1.5fr_1.5fr_1.5fr] gap-4 px-6 py-4 bg-secondary/30 border-b border-border">
                                <span className="text-sm font-medium text-muted-foreground">#</span>
                                <span className="text-sm font-medium text-muted-foreground">Asset</span>
                                <span className="text-sm font-medium text-muted-foreground text-right">Price (INR)</span>
                                <span className="text-sm font-medium text-muted-foreground text-right">24h</span>
                                <span className="text-sm font-medium text-muted-foreground text-right">24h High</span>
                                <span className="text-sm font-medium text-muted-foreground text-right">Volume</span>
                                <span className="text-sm font-medium text-muted-foreground text-right">Action</span>
                            </div>

                            {/* Asset Rows */}
                            <div className="divide-y divide-border">
                                {assets.map((asset) => {
                                    const isPositive = asset.price_change_percentage_24h >= 0;

                                    return (
                                        <div
                                            key={asset.id}
                                            className="grid grid-cols-1 md:grid-cols-[0.5fr_2fr_1.5fr_1fr_1.5fr_1.5fr_1.5fr] gap-4 px-6 py-4 hover:bg-secondary/20 transition-colors"
                                        >
                                            {/* Rank */}
                                            <div className="hidden md:flex items-center">
                                                <span className="text-sm text-muted-foreground">{asset.market_cap_rank}</span>
                                            </div>

                                            {/* Asset Info */}
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={asset.image}
                                                    alt={asset.name}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                                <div>
                                                    <p className="font-semibold text-foreground">{asset.symbol.toUpperCase()}</p>
                                                    <p className="text-sm text-muted-foreground">{asset.name}</p>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="flex items-center justify-between md:justify-end">
                                                <span className="text-sm text-muted-foreground md:hidden">Price:</span>
                                                <p className="font-semibold text-foreground">
                                                    {formatPrice(asset.current_price)}
                                                </p>
                                            </div>

                                            {/* 24h Change */}
                                            <div className="flex items-center justify-between md:justify-end">
                                                <span className="text-sm text-muted-foreground md:hidden">24h:</span>
                                                <div className={`flex items-center gap-1 ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                                                    {isPositive ? (
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    ) : (
                                                        <ArrowDownRight className="w-4 h-4" />
                                                    )}
                                                    <span className="font-medium text-sm">
                                                        {isPositive ? '+' : ''}{asset.price_change_percentage_24h?.toFixed(2) || '0.00'}%
                                                    </span>
                                                </div>
                                            </div>

                                            {/* 24h High */}
                                            <div className="flex items-center justify-between md:justify-end">
                                                <span className="text-sm text-muted-foreground md:hidden">High:</span>
                                                <p className="text-sm text-muted-foreground">
                                                    {asset.high_24h ? formatPrice(asset.high_24h) : '—'}
                                                </p>
                                            </div>

                                            {/* Volume */}
                                            <div className="flex items-center justify-between md:justify-end">
                                                <span className="text-sm text-muted-foreground md:hidden">Vol:</span>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatVolume(asset.total_volume)}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 justify-end">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleBuy(asset.symbol)}
                                                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-3"
                                                >
                                                    <TrendingUp className="w-3 h-3 mr-1" />
                                                    Buy
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleSell(asset.symbol)}
                                                    className="border-destructive text-destructive hover:bg-destructive/10 px-3"
                                                >
                                                    <TrendingDown className="w-3 h-3 mr-1" />
                                                    Sell
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Info Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-muted-foreground">
                            Live prices from CoinGecko • Auto-refreshes every 2 minutes • All prices in INR
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
