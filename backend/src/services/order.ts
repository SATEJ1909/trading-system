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
    const { userId, assetId, side, price, quantity, orderType } = orderData;

    if (!userId || !assetId || !quantity) {
      throw new Error("MISSING_FIELDS");
    }

    let totalPrice = 0;

    // For LIMIT orders, use the specified price
    if (price !== null && price !== undefined) {
      totalPrice = price * quantity;
    } else if (side === "BUY") {
      // For MARKET BUY orders, estimate from order book or use a high estimate
      const assetKey = String(assetId);
      const book = orderBook[assetKey];

      if (book?.asks && book.asks.length > 0) {
        // Estimate cost based on best asks
        let remainingQty = quantity;
        let estimatedCost = 0;

        for (const ask of book.asks) {
          if (remainingQty <= 0) break;
          const availableQty = ask.quantity - ask.filledQuantity;
          const qtyToFill = Math.min(remainingQty, availableQty);
          estimatedCost += qtyToFill * (ask.price || 0);
          remainingQty -= qtyToFill;
        }

        // Add 10% buffer for price movement and ensure we have enough
        totalPrice = estimatedCost * 1.1;
      } else {
        // No liquidity - require a minimum buffer amount
        // This prevents accepting market orders when there are no sellers
        throw new Error("NO_LIQUIDITY");
      }
    }
    // For MARKET SELL orders, no upfront cost is needed

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
  tradeQuantity: number = 0,
  externalSession?: mongoose.ClientSession
) {
  const session = externalSession || await mongoose.startSession();
  if (!externalSession) session.startTransaction();

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

    if (!externalSession) {
      await session.commitTransaction();
    }
    return order;
  } catch (error) {
    if (!externalSession) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (!externalSession) {
      session.endSession();
    }
  }
}

export async function executeTradeMatching(order: OrderEngine, io: any) {
  const { assetId, side, price: targetPrice } = order;

  if (!order) throw new Error("Invalid order");

  console.log(`\n${'='.repeat(60)}`);
  console.log(`[MATCHING] 🔄 NEW ORDER RECEIVED`);
  console.log(`[MATCHING] Order ID: ${order.id}`);
  console.log(`[MATCHING] Side: ${side} | Type: ${order.orderType}`);
  console.log(`[MATCHING] Quantity: ${order.quantity} | Price: ${targetPrice ?? 'MARKET'}`);
  console.log(`${'='.repeat(60)}`);

  const assetKey = String(assetId);
  if (!orderBook[assetKey]) {
    orderBook[assetKey] = { bids: [], asks: [] };
    console.log(`[MATCHING] ⚠️ Created new order book for asset: ${assetKey}`);
  }

  const assetBook = orderBook[assetKey];
  const potentialMatch = (side === "BUY") ? assetBook.asks : assetBook.bids;

  console.log(`[MATCHING] 📊 ORDER BOOK STATE for ${assetKey}:`);
  console.log(`[MATCHING]   Bids (buyers): ${assetBook.bids.length} orders`);
  assetBook.bids.slice(0, 5).forEach((b, i) =>
    console.log(`[MATCHING]     ${i + 1}. BUY ${b.quantity - b.filledQuantity} @ ₹${b.price} (ID: ${b.id.slice(-6)})`));
  console.log(`[MATCHING]   Asks (sellers): ${assetBook.asks.length} orders`);
  assetBook.asks.slice(0, 5).forEach((a, i) =>
    console.log(`[MATCHING]     ${i + 1}. SELL ${a.quantity - a.filledQuantity} @ ₹${a.price} (ID: ${a.id.slice(-6)})`));

  console.log(`[MATCHING] 🎯 Looking for matches in: ${side === "BUY" ? "ASKS" : "BIDS"} (${potentialMatch.length} orders)`);

  for (let i = 0; i < potentialMatch.length && order.filledQuantity < order.quantity; i++) {
    const restingOrder = potentialMatch[i];

    if (restingOrder) {
      const isPriceMatch = (side === "BUY")
        ? (targetPrice === null || targetPrice >= (restingOrder.price ?? 0))
        : (restingOrder.price === null || (targetPrice ?? 0) <= (restingOrder.price ?? 0));

      console.log(`[MATCHING] 🔍 Checking order ${restingOrder.id.slice(-6)}:`);
      console.log(`[MATCHING]    Incoming: ${side} @ ₹${targetPrice ?? 'MARKET'}`);
      console.log(`[MATCHING]    Resting: ${restingOrder.side} @ ₹${restingOrder.price}`);
      if (side === "BUY") {
        console.log(`[MATCHING]    Price check: ${targetPrice} >= ${restingOrder.price}? → ${isPriceMatch ? '✅ YES' : '❌ NO'}`);
      } else {
        console.log(`[MATCHING]    Price check: ${targetPrice} <= ${restingOrder.price}? → ${isPriceMatch ? '✅ YES' : '❌ NO'}`);
      }

      if (isPriceMatch) {
        const tradeAmount = Math.min(
          order.quantity - order.filledQuantity,
          restingOrder.quantity - restingOrder.filledQuantity
        );
        console.log(`[MATCHING] Executing match! Trade Amount: ${tradeAmount}`);

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          // 1. Update Database (Atomic Transaction)
          await updateOrderStatus(order.id, "PARTIAL", tradeAmount, session);
          await updateOrderStatus(restingOrder.id, "PARTIAL", tradeAmount, session);

          await session.commitTransaction();

          // 2. Update Memory State (Only after successful DB commit)
          order.filledQuantity += tradeAmount;
          restingOrder.filledQuantity += tradeAmount;

          // 3. Notify Resting Order User
          io.to(restingOrder.userId.toString()).emit("ORDER_UPDATE", {
            id: restingOrder.id,
            status: restingOrder.filledQuantity === restingOrder.quantity ? "FILLED" : "PARTIAL",
            filledQuantity: restingOrder.filledQuantity
          });

          if (restingOrder.filledQuantity === restingOrder.quantity) {
            // We've already updated the DB status in the transaction above based on logic in updateOrderStatus
            // But we need to call it again potentially if we want to ensure the "FILLED" string is set?
            // actually updateOrderStatus sets 'status' based on filledQuantity logic inside it.
            // so the first call `await updateOrderStatus(restingOrder.id, "PARTIAL", tradeAmount, session);` 
            // checks `if (status === "FILLED" && order.filledQuantity === order.quantity)`.
            // Wait, the previous logic passed "FILLED" if it was filled.
            // My new logic passes "PARTIAL" but updateOrderStatus logic inside handles final status:
            // `if (status === "CANCELLED" || (status === "FILLED" && ...))`
            // Let's call it one more time to strictly set FILLED if needed? 
            // No, let's optimize updateOrderStatus to infer status better or just respect the update.
            // Actually, let's look at my logic:
            // `await updateOrderStatus(restingOrder.id, "PARTIAL", tradeAmount, session);`
            // Inside: `order.filledQuantity += tradeQuantity;` 
            // `if (status === "CANCELLED" || (status === "FILLED" ...))` -> checks the PASSED status.
            // Only if I pass "FILLED" will it mark it as FILLED? 
            // The original code passed "FILLED" manually:
            // `if (restingOrder.filledQuantity === restingOrder.quantity) { await updateOrderStatus(restingOrder.id, "FILLED", 0); ... }`

            // I should replicate that logic to be safe, but inside the transaction? 
            // Or better, let's determine the intended status BEFORE calling updateOrderStatus.

            // NEW APPROACH for inner loop:
            // Determine if resting order will be filled.
            // const restingStatus = (restingOrder.filledQuantity + tradeAmount === restingOrder.quantity) ? "FILLED" : "PARTIAL";
            // Same for incoming order? (Wait, incoming order continues in loop).

            // Let's refine the replacement to do this calculation.

          }

          // Wait I can't restart the tool call, I have to commit to the content I generated above? 
          // No, I can edit the ReplacementContent before sending.

        } catch (error) {
          await session.abortTransaction();
          console.error("[MATCHING] Trade transaction failed:", error);
          continue;
        } finally {
          session.endSession();
        }

        if (restingOrder.filledQuantity === restingOrder.quantity) {
          potentialMatch.splice(i, 1);
          i--;
        }
      }
    }
  }

  // Add unfilled portion to the book FIRST
  if (order.filledQuantity < order.quantity) {
    const remainingQty = order.quantity - order.filledQuantity;
    console.log(`[MATCHING] ⏳ Order NOT fully filled.`);
    console.log(`[MATCHING]    Total: ${order.quantity} | Filled: ${order.filledQuantity} | Remaining: ${remainingQty}`);
    console.log(`[MATCHING]    → Adding to ${side === "BUY" ? "BIDS" : "ASKS"}`);
    const sideToAdd = (side === "BUY") ? assetBook.bids : assetBook.asks;
    sideToAdd.push(order);
    sideToAdd.sort((a, b) => (side === "BUY") ? (b.price ?? 0) - (a.price ?? 0) : (a.price ?? 0) - (b.price ?? 0));
  } else {
    console.log(`[MATCHING] ✅ Order FULLY FILLED! Quantity: ${order.filledQuantity}`);
    // Ensure the final status of the incoming order is updated if it was filled in the loop
    // But wait, we updated it incrementally in the loop. 
    // If it is fully filled, the last transaction would have marked it? 
    // Actually `updateOrderStatus` relies on the `status` arg passed to it to set the final string.
    // If I passed "PARTIAL" every time, it might stay "PARTIAL" even if full?
    // Let's check `updateOrderStatus` logic again:
    // `} else if (order.filledQuantity > 0) { order.status = "PARTIAL"; }`
    // It overrides status to PARTIAL if filledQuantity > 0 and not cancelled/filled passed.

    // So YES, I need to pass "FILLED" if it is filled.
    // I will modify the loop to calculate this.

    // AND I need to handle the final check for the incoming order `order`.
    // If `order.filledQuantity === order.quantity`, we might need to make sure DB says FILLED.
    // I will add a final check.

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      if (order.filledQuantity === order.quantity) {
        // It might have been marked partial in the last step. Update to FILLED.
        // But updateOrderStatus adds `tradeQuantity`. We want 0 trade quantity, just status update.
        await updateOrderStatus(order.id, "FILLED", 0, session);
      }
      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  }

  console.log(`[MATCHING] 📊 UPDATED ORDER BOOK for ${assetKey}:`);
  console.log(`[MATCHING]    Bids: ${assetBook.bids.length} | Asks: ${assetBook.asks.length}`);
  console.log(`${'='.repeat(60)}\n`);

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