import mongoose, { Types, Schema, model } from "mongoose";

export interface IPortfolio {
  userId: Types.ObjectId;    // Owner of the asset
  assetId: Types.ObjectId;   // Which asset
  availableQuantity: number;
  lockedQuantity: number;        // Total holding
  avgBuyPrice: number;       // Weighted average buy price
  updatedAt: Date;
}
const portfolioSchema = new Schema<IPortfolio>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assetId: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
      index: true,
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    lockedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    avgBuyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound unique index to prevent duplicate portfolio entries for same user+asset
portfolioSchema.index({ userId: 1, assetId: 1 }, { unique: true });

const PortfolioModel = mongoose.model<IPortfolio>("Portfolio", portfolioSchema);
export default PortfolioModel