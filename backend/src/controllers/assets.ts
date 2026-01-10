import AssetModel from "../models/assets.js"
import type { Request, Response } from "express";



export const getAssets = async (req: Request, res: Response): Promise<void> => {
  try {
    const assets = await AssetModel.find({});

    res.status(200).json({
      success: true,
      count: assets.length,
      data: assets,
    });
  } catch (error) {
    console.error("Get Assets Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
