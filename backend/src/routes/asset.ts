import { Router } from "express";
const assetRouter = Router();
import { getAssets } from "../controllers/assets.js";


assetRouter.get("/", getAssets);


export default assetRouter