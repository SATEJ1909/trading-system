import WalletModel from "../models/wallet.js";
import PortfolioModel from "../models/portfolio.js";
import AssetModel from "../models/assets.js";
import type { Request, Response } from "express";
import { Types } from "mongoose";

// Constants for validation limits
const MAX_ADD_MONEY_AMOUNT = 10000;
const MIN_AMOUNT = 1;
const MAX_AIRDROP_QUANTITY = 100;

export const addMoney = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (!amount || typeof amount !== 'number' || amount < MIN_AMOUNT || amount > MAX_ADD_MONEY_AMOUNT) {
      res.status(400).json({
        success: false,
        message: `Invalid amount. It must be between ${MIN_AMOUNT} and ${MAX_ADD_MONEY_AMOUNT}`
      });
      return;
    }

    const updatedWallet = await WalletModel.findOneAndUpdate(
      { userId },
      { $inc: { availableBalance: amount } },
      {
        upsert: true,
        new: true
      }
    );

    res.status(200).json({
      success: true,
      message: "Amount added successfully",
      balance: updatedWallet.availableBalance
    });
  } catch (error) {
    console.error("addMoney error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}


export const getWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const wallet = await WalletModel.findOne({ userId });

    if (!wallet) {
      res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: wallet,
    });

  } catch (error) {
    console.error("getWallet error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Airdrop virtual assets to user (for testing/bootstrapping the trading system)
export const airdropAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assetId, quantity } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    // Validate assetId is a valid MongoDB ObjectId
    if (!assetId || !Types.ObjectId.isValid(assetId)) {
      res.status(400).json({
        success: false,
        message: "Invalid asset ID format"
      });
      return;
    }

    if (!quantity || typeof quantity !== 'number' || quantity < MIN_AMOUNT || quantity > MAX_AIRDROP_QUANTITY) {
      res.status(400).json({
        success: false,
        message: `Invalid quantity. It must be between ${MIN_AMOUNT} and ${MAX_AIRDROP_QUANTITY}`
      });
      return;
    }

    // Verify the asset exists
    const asset = await AssetModel.findById(assetId);
    if (!asset) {
      res.status(404).json({
        success: false,
        message: "Asset not found"
      });
      return;
    }

    // Add asset to user's portfolio
    const portfolio = await PortfolioModel.findOneAndUpdate(
      { userId, assetId },
      {
        $inc: { availableQuantity: quantity },
        $setOnInsert: { lockedQuantity: 0, avgBuyPrice: 0 }
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: `Successfully received ${quantity} ${asset.symbol}`,
      data: {
        assetId,
        symbol: asset.symbol,
        availableQuantity: portfolio.availableQuantity,
        lockedQuantity: portfolio.lockedQuantity
      }
    });
  } catch (error) {
    console.error("airdropAsset error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get user's portfolio
export const getPortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const portfolio = await PortfolioModel.find({ userId }).populate('assetId');

    res.status(200).json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    console.error("getPortfolio error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get user's order history
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    console.log('[getOrders] Fetching orders for userId:', userId);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    // Import OrderModel dynamically to avoid circular dependency
    const OrderModel = (await import("../models/order.js")).default;

    const orders = await OrderModel.find({ userId })
      .populate('assetId', 'symbol name')
      .sort({ createdAt: -1 })
      .limit(50);

    console.log('[getOrders] Found', orders.length, 'orders');

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("getOrders error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
