import { Router } from "express";
const assetRouter = Router();
import { getAssets, getAssetById, getAssetBySymbol, getOrCreateAssetBySymbol } from "../controllers/assets.js";


assetRouter.get("/", getAssets);
assetRouter.get("/symbol/:symbol", getAssetBySymbol);
assetRouter.post("/symbol/:symbol", getOrCreateAssetBySymbol);  // Auto-create if not exists
assetRouter.get("/:id", getAssetById);


export default assetRouter