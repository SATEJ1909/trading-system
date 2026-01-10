import WalletModel from "../models/wallet.js";
import type { Request, Response } from "express";


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

    if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 10000) {
      res.status(400).json({
        success: false,
        message: "Invalid amount , It must between 1 to 10000"
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
      balance: updatedWallet?.availableBalance
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "internal server error"
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
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
