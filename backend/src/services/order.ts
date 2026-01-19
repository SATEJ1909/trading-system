import OrderModel, { type IOrder } from "../models/order.js";
import WalletModel from "../models/wallet.js";
import PortfolioModel from "../models/portfolio.js";
import mongoose from "mongoose";

// Unified Interface
interface OrderEngine extends IOrder {
  id: string;
}

// Single Source of Truth for Order Book
const orderBook: Record<string, { bids: OrderEngine[], asks: OrderEngine[] }> = {};

export async function createOrder(orderData: Partial<IOrder>): Promise<IOrder> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, assetId, side, price, quantity } = orderData;

    if (!userId || !assetId || !quantity) {
      throw new Error("MISSING_FIELDS");
    }

    const totalPrice = (price || 0) * quantity;

    if (side === "BUY") {
      const wallet = await WalletModel.findOneAndUpdate(
        { userId, availableBalance: { $gte: totalPrice } },
        {
          $inc: {
            availableBalance: -totalPrice,
            lockedBalance: totalPrice
          }
        },
        { new: true, session }
      );

      if (!wallet) throw new Error("INSUFFICIENT_FUNDS");

    } else {
      const portfolio = await PortfolioModel.findOneAndUpdate(
        { userId, assetId, availableQuantity: { $gte: quantity } },
        {
          $inc: {
            availableQuantity: -quantity,
            lockedQuantity: quantity
          }
        },
        { new: true, session }
      );

      if (!portfolio) throw new Error("INSUFFICIENT_ASSET");
    }

    const [newOrder] = await OrderModel.create([orderData], { session });

    await session.commitTransaction();
    if (!newOrder) {
      throw new Error("Failed to create order")
    }
    return newOrder;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}


export async function updateOrderStatus(
  orderId: string,
  status: "PARTIAL" | "FILLED" | "CANCELLED",
  tradeQuantity: number = 0
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await OrderModel.findById(orderId).session(session);
    if (!order || order.status === "FILLED" || order.status === "CANCELLED") {
      throw new Error("ORDER_INACTIVE");
    }

    const tradeValue = tradeQuantity * (order.price || 0);

    if (status === "PARTIAL" || status === "FILLED") {
      if (order.side === "BUY") {
        await WalletModel.findOneAndUpdate(
          { userId: order.userId },
          { $inc: { lockedBalance: -tradeValue } },
          { session }
        );
        await PortfolioModel.findOneAndUpdate(
          { userId: order.userId, assetId: order.assetId },
          { $inc: { quantity: tradeQuantity, availableQuantity: tradeQuantity } },
          { session, upsert: true }
        );
      } else {
        await PortfolioModel.findOneAndUpdate(
          { userId: order.userId, assetId: order.assetId },
          { $inc: { quantity: -tradeQuantity, lockedQuantity: -tradeQuantity } },
          { session }
        );
        await WalletModel.findOneAndUpdate(
          { userId: order.userId },
          { $inc: { availableBalance: tradeValue } },
          { session }
        );
      }
      order.filledQuantity += tradeQuantity;
    }

    if (status === "CANCELLED" || (status === "FILLED" && order.filledQuantity === order.quantity)) {
      order.status = status;
    } else if (order.filledQuantity > 0) {
      order.status = "PARTIAL";
    }

    await order.save({ session });
    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function executeTradeMatching(order: OrderEngine, io: any) {
  const { assetId, side, price: targetPrice } = order;

  if (!order) throw new Error("Invalid order");

  const assetKey = String(assetId);
  if (!orderBook[assetKey]) {
    orderBook[assetKey] = { bids: [], asks: [] };
  }

  const assetBook = orderBook[assetKey];
  const potentialMatch = (side === "BUY") ? assetBook.asks : assetBook.bids;

  for (let i = 0; i < potentialMatch.length && order.filledQuantity < order.quantity; i++) {
    const restingOrder = potentialMatch[i];

    if (restingOrder) {
      const isPriceMatch = (side === "BUY")
        ? (targetPrice === null || targetPrice >= (restingOrder.price ?? 0))
        : (restingOrder.price === null || (targetPrice ?? 0) <= (restingOrder.price ?? 0));

      if (isPriceMatch) {
        const tradeAmount = Math.min(
          order.quantity - order.filledQuantity,
          restingOrder.quantity - restingOrder.filledQuantity
        );

        // 1. Update Database
        await updateOrderStatus(order.id, "PARTIAL", tradeAmount);
        await updateOrderStatus(restingOrder.id, "PARTIAL", tradeAmount);

        // 2. Update Memory State
        order.filledQuantity += tradeAmount;
        restingOrder.filledQuantity += tradeAmount;

        // 3. Notify Resting Order User
        io.to(restingOrder.userId.toString()).emit("ORDER_UPDATE", {
          id: restingOrder.id,
          status: restingOrder.filledQuantity === restingOrder.quantity ? "FILLED" : "PARTIAL",
          filledQuantity: restingOrder.filledQuantity
        });

        if (restingOrder.filledQuantity === restingOrder.quantity) {
          await updateOrderStatus(restingOrder.id, "FILLED", 0);
          potentialMatch.splice(i, 1);
          i--;
        }
      }
    }
  }

  // Add unfilled portion to the book FIRST
  if (order.filledQuantity < order.quantity) {
    const sideToAdd = (side === "BUY") ? assetBook.bids : assetBook.asks;
    sideToAdd.push(order);
    sideToAdd.sort((a, b) => (side === "BUY") ? (b.price ?? 0) - (a.price ?? 0) : (a.price ?? 0) - (b.price ?? 0));
  } else {
    await updateOrderStatus(order.id, "FILLED", 0);
  }

  // THEN broadcast Market Update (with the new order included)
  io.to(`MARKET_${assetKey}`).emit("MARKET_UPDATE", {
    bids: assetBook.bids.slice(0, 10),
    asks: assetBook.asks.slice(0, 10)
  });
}


export async function cancelOrder(order: OrderEngine) {
  await updateOrderStatus(order.id, "CANCELLED", 0);
}


export async function initializeMatchingEngine() {
  try {
    const activeOrders = await OrderModel.find({
      status: { $in: ["OPEN", "PARTIAL"] }
    });

    for (const order of activeOrders) {
      const assetId = order.assetId.toString();

      if (!orderBook[assetId]) {
        orderBook[assetId] = { bids: [], asks: [] };
      }

      const engineOrder: OrderEngine = {
        ...order.toObject(),
        id: order._id.toString()
      };

      if (engineOrder.side === "BUY") {
        orderBook[assetId].bids.push(engineOrder);
      } else {
        orderBook[assetId].asks.push(engineOrder);
      }
    }

    Object.keys(orderBook).forEach((assetId) => {
      const book = orderBook[assetId];
      if (book) {
        book.bids.sort((a, b) => (b.price || 0) - (a.price || 0));
        book.asks.sort((a, b) => (a.price || 0) - (b.price || 0));
      }
    });

    console.log("Engine Hydrated Successfully");
  } catch (error) {
    console.error("Engine Initialization Failed:", error);
  }
}



export const getInMemBook = (assetId: string) => {
  const book = orderBook[assetId] || { bids: [], asks: [] };
  return {
    bids: book.bids.slice(0, 10),
    asks: book.asks.slice(0, 10)
  };
};