import mongoose, { Schema, model, Types } from "mongoose";
export interface IWallet {
  userId: Types.ObjectId;
  availableBalance: number;
  lockedBalance: number;
  currency: "VIRTUAL_INR" | "USD";
}

const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },
    availableBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    lockedBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      enum: ["VIRTUAL_INR", "USD"],
      default: "VIRTUAL_INR",
      required: true,
    },
  },
  { timestamps: true }
);

const WalletModel = mongoose.model<IWallet>("Wallet" , walletSchema)
export default WalletModel;