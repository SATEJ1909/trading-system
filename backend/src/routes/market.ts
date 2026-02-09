import { Router } from "express";
import {
    getMarkets,
    getOHLC,
    getCoinDetails,
    getSimplePrices,
    searchCoins,
    getMarketsByCoinIds,
} from "../controllers/market.js";

const marketRouter = Router();

// Public routes - no auth required
marketRouter.get("/", getMarkets);                    // GET /api/v1/market - Top 25 cryptos
marketRouter.get("/prices", getSimplePrices);         // GET /api/v1/market/prices?ids=bitcoin,ethereum
marketRouter.get("/search", searchCoins);             // GET /api/v1/market/search?query=bit
marketRouter.get("/coins", getMarketsByCoinIds);      // GET /api/v1/market/coins?ids=bitcoin,ethereum
marketRouter.get("/ohlc/:coinId", getOHLC);           // GET /api/v1/market/ohlc/bitcoin?days=7
marketRouter.get("/coin/:coinId", getCoinDetails);    // GET /api/v1/market/coin/bitcoin

export default marketRouter;
