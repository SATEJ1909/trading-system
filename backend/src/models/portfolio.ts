import mongoose, { Types , Schema  , model } from "mongoose";

export interface IPortfolio {
  userId: Types.ObjectId;    // Owner of the asset
  assetId: Types.ObjectId;   // Which asset
  quantity: number;          // Total holding
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
    quantity: {
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

const PortfolioModel = mongoose.model<IPortfolio>("Portfolio" , portfolioSchema);
export default PortfolioModel