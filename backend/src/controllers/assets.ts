import AssetModel from "../models/asstes.js"
import type { Request, Response } from "express";



export const getAssets = async (req: Request, res: Response) => {
  try {
    const assets = await AssetModel.find({});

    return res.status(200).json({
      success: true,
      count: assets.length,
      data: assets,
    });
  } catch (error) {
    console.error("Get Assets Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
