import mongoose , {Schema } from "mongoose";
export interface IAsset {
  symbol: string;       
  name: string;          
  source: "COINGECKO" | "BINANCE" | "MANUAL";
  isActive: boolean;
  createdAt: Date;
}

const assetSchema = new Schema<IAsset>(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ["COINGECKO", "BINANCE", "MANUAL"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);


const AssetModel = mongoose.model<IAsset>("Assets" , assetSchema)


export default AssetModel ;