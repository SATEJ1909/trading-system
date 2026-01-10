import { Router } from "express";
import { addMoney, getWallet } from "../controllers/wallet.js";
import authService from "../middleware/auth.js";
const WalletRouter = Router();

WalletRouter.post("/addMoney", authService, addMoney);
WalletRouter.get("/", authService, getWallet);


export default WalletRouter;