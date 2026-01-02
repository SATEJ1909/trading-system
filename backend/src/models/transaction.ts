import mongoose, { Schema , Types } from "mongoose";

export enum TransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

export enum TransactionPurpose {
  WALLET_TOPUP = "WALLET_TOPUP",
  TRADE_BUY = "TRADE_BUY",
  TRADE_SELL = "TRADE_SELL",
  REFUND = "REFUND",
  SYSTEM = "SYSTEM",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export enum TransactionReferenceType {
  PAYMENT = "PAYMENT",
  ORDER = "ORDER",
  SYSTEM = "SYSTEM",
}

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  walletId: Types.ObjectId;

  type: TransactionType;
  amount: number;
  purpose: TransactionPurpose;

  status: TransactionStatus;

  referenceType: TransactionReferenceType;
  referenceId?: string;

  balanceBefore?: number;
  balanceAfter?: number;

  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    purpose: {
      type: String,
      enum: Object.values(TransactionPurpose),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
    referenceType: {
      type: String,
      enum: Object.values(TransactionReferenceType),
      default: TransactionReferenceType.SYSTEM,
    },
    referenceId: {
      type: String,
    },
    balanceBefore: {
      type: Number,
    },
    balanceAfter: {
      type: Number,
    },
  },
  { timestamps: true }
);


const TransactionModel = mongoose.model<ITransaction>("Transaction" , transactionSchema);


export default TransactionModel ;