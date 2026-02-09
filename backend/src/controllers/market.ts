import type { Request, Response } from "express";

// CoinGecko API base URL
const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

// Cache for rate limit protection
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute cache

const getCached = (key: string) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
};

const setCache = (key: string, data: any) => {
    cache.set(key, { data, timestamp: Date.now() });
};

// Get top 25 cryptocurrencies (for Markets page)
export const getMarkets = async (req: Request, res: Response): Promise<void> => {
    const cacheKey = "markets_top25";
    const cached = getCached(cacheKey);

    if (cached) {
        res.json({ success: true, data: cached, cached: true });
        return;
    }

    try {
        const response = await fetch(
            `${COINGECKO_BASE}/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=24h`
        );

        if (response.status === 429) {
            res.status(429).json({
                success: false,
                message: "Rate limited by CoinGecko. Please try again later.",
            });
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to fetch market data");
        }

        const data = await response.json();
        setCache(cacheKey, data);

        res.json({ success: true, data });
    } catch (error: any) {
        console.error("Market fetch error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch market data",
        });
    }
};

// Get OHLC data for a specific coin (for chart)
export const getOHLC = async (req: Request, res: Response): Promise<void> => {
    const { coinId } = req.params;
    const { days = "7" } = req.query;

    const cacheKey = `ohlc_${coinId}_${days}`;
    const cached = getCached(cacheKey);

    if (cached) {
        res.json({ success: true, data: cached, cached: true });
        return;
    }

    try {
        const response = await fetch(
            `${COINGECKO_BASE}/coins/${coinId}/ohlc?vs_currency=inr&days=${days}`
        );

        if (response.status === 429) {
            res.status(429).json({
                success: false,
                message: "Rate limited. Please try again later.",
            });
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to fetch OHLC data");
        }

        const data = await response.json();
        setCache(cacheKey, data);

        res.json({ success: true, data });
    } catch (error: any) {
        console.error("OHLC fetch error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch OHLC data",
        });
    }
};

// Get coin details (for market stats)
export const getCoinDetails = async (req: Request, res: Response): Promise<void> => {
    const { coinId } = req.params;

    const cacheKey = `coin_${coinId}`;
    const cached = getCached(cacheKey);

    if (cached) {
        res.json({ success: true, data: cached, cached: true });
        return;
    }

    try {
        const response = await fetch(
            `${COINGECKO_BASE}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
        );

        if (response.status === 429) {
            res.status(429).json({
                success: false,
                message: "Rate limited. Please try again later.",
            });
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to fetch coin details");
        }

        const data = await response.json();
        setCache(cacheKey, data);

        res.json({ success: true, data });
    } catch (error: any) {
        console.error("Coin details fetch error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch coin details",
        });
    }
};

// Get simple prices (for landing page)
export const getSimplePrices = async (req: Request, res: Response): Promise<void> => {
    const ids = req.query.ids as string || "bitcoin,ethereum,solana,cardano";

    const cacheKey = `simple_${ids}`;
    const cached = getCached(cacheKey);

    if (cached) {
        res.json({ success: true, data: cached, cached: true });
        return;
    }

    try {
        const response = await fetch(
            `${COINGECKO_BASE}/simple/price?ids=${ids}&vs_currencies=usd,inr&include_24hr_change=true`
        );

        if (response.status === 429) {
            res.status(429).json({
                success: false,
                message: "Rate limited. Please try again later.",
            });
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to fetch prices");
        }

        const data = await response.json();
        setCache(cacheKey, data);

        res.json({ success: true, data });
    } catch (error: any) {
        console.error("Simple prices fetch error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch prices",
        });
    }
};

// Search coins
export const searchCoins = async (req: Request, res: Response): Promise<void> => {
    const { query } = req.query;

    if (!query) {
        res.status(400).json({
            success: false,
            message: "Query parameter is required",
        });
        return;
    }

    try {
        const response = await fetch(
            `${COINGECKO_BASE}/search?query=${encodeURIComponent(query as string)}`
        );

        if (response.status === 429) {
            res.status(429).json({
                success: false,
                message: "Rate limited. Please try again later.",
            });
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to search coins");
        }

        const data = await response.json();

        res.json({ success: true, data });
    } catch (error: any) {
        console.error("Search error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to search coins",
        });
    }
};

// Get market data for specific coin IDs (for dashboard)
export const getMarketsByCoinIds = async (req: Request, res: Response): Promise<void> => {
    const { ids } = req.query;

    if (!ids) {
        res.status(400).json({
            success: false,
            message: "Coin IDs are required",
        });
        return;
    }

    const cacheKey = `markets_${ids}`;
    const cached = getCached(cacheKey);

    if (cached) {
        res.json({ success: true, data: cached, cached: true });
        return;
    }

    try {
        const response = await fetch(
            `${COINGECKO_BASE}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h`
        );

        if (response.status === 429) {
            res.status(429).json({
                success: false,
                message: "Rate limited. Please try again later.",
            });
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to fetch market data");
        }

        const data = await response.json();
        setCache(cacheKey, data);

        res.json({ success: true, data });
    } catch (error: any) {
        console.error("Markets by IDs fetch error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch market data",
        });
    }
};
