import mongoose from "mongoose";
import { Types ,Schema } from "mongoose";

export interface ITrade {
  buyOrderId: Types.ObjectId;   // BUY order involved
  sellOrderId: Types.ObjectId;  // SELL order involved
  assetId: Types.ObjectId;      // Traded asset
  price: number;                // Execution price
  quantity: number;             // Executed quantity
  executedAt: Date;             // Execution timestamp
}
const tradeSchema = new Schema<ITrade>(
  {
    buyOrderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    sellOrderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    assetId: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    executedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    versionKey: false,
  }
);
const TradeModel = mongoose.model<ITrade>("Trade", tradeSchema);
export default TradeModel;