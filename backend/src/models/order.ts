import  mongoose , { Types  , Schema , model} from "mongoose";

export interface IOrder {
  userId: Types.ObjectId;
  assetId: Types.ObjectId;
  side: "BUY" | "SELL";
  orderType: "MARKET" | "LIMIT";
  price: number | null;
  quantity: number;
  filledQuantity: number;
  status: "OPEN" | "PARTIAL" | "FILLED" | "CANCELLED";
}


const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assetId: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    side: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
    },
    orderType: {
      type: String,
      enum: ["MARKET", "LIMIT"],
      required: true,
    },
    price: {
      type: Number,
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    filledQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["OPEN", "PARTIAL", "FILLED", "CANCELLED"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model<IOrder>("Order" , orderSchema);
export default OrderModel ;
