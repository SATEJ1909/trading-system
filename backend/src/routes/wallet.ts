import { Router } from "express";
import { addMoney, getWallet, airdropAsset, getPortfolio, getOrders } from "../controllers/wallet.js";
import authService from "../middleware/auth.js";
import { addMoneyLimiter, airdropLimiter } from "../middleware/rateLimiter.js";

const WalletRouter = Router();

WalletRouter.post("/addMoney", authService, addMoneyLimiter, addMoney);
WalletRouter.get("/", authService, getWallet);
WalletRouter.post("/airdrop", authService, airdropLimiter, airdropAsset);
WalletRouter.get("/portfolio", authService, getPortfolio);
WalletRouter.get("/orders", authService, getOrders);

export default WalletRouter;

