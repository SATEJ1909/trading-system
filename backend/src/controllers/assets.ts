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

export const getAssetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const asset = await AssetModel.findById(id);

    if (!asset) {
      res.status(404).json({
        success: false,
        message: "Asset not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    console.error("Get Asset By ID Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAssetBySymbol = async (req: Request, res: Response): Promise<void> => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      res.status(400).json({
        success: false,
        message: "Symbol is required",
      });
      return;
    }

    const asset = await AssetModel.findOne({ symbol: symbol.toUpperCase() });

    if (!asset) {
      res.status(404).json({
        success: false,
        message: "Asset not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    console.error("Get Asset By Symbol Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Auto-create asset if not exists (upsert)
export const getOrCreateAssetBySymbol = async (req: Request, res: Response): Promise<void> => {
  try {
    const { symbol } = req.params;
    const { name } = req.body; // Optional name from request body

    if (!symbol) {
      res.status(400).json({
        success: false,
        message: "Symbol is required",
      });
      return;
    }

    const upperSymbol = symbol.toUpperCase();

    // Atomically find or create the asset
    const asset = await AssetModel.findOneAndUpdate(
      { symbol: upperSymbol },
      {
        $setOnInsert: {
          symbol: upperSymbol,
          name: name || upperSymbol,
          source: "COINGECKO",
          isActive: true,
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    console.error("Get Or Create Asset Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
