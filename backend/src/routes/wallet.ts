import { Router } from "express";
import { addMoney  , getWallet} from "../controllers/wallet.js";
import authService from "../middleware/auth.js";
const WalletRouter = Router();

//@ts-ignore
WalletRouter.post("/addMoney" , authService , addMoney);
//@ts-ignore
WalletRouter.get("/" , authService , getWallet);


export default WalletRouter ;