import { socketAuth } from "../middleware/socketAuth.js";
import type { CustomSocket } from "../middleware/socketAuth.js";
import { Server } from "socket.io";
import {
  executeTradeMatching,
  createOrder,
  getInMemBook,
} from "../services/order.js";

const rateMap = new Map<string, number[]>();

const allowEvent = (
  userId: string,
  limit = 5,
  windowMs = 10_000
) => {
  const now = Date.now();
  const events = rateMap.get(userId) || [];
  const valid = events.filter(t => now - t < windowMs);

  if (valid.length >= limit) return false;

  valid.push(now);
  rateMap.set(userId, valid);
  return true;
};

export const setupSocketService = (io: Server) => {
  io.use(socketAuth);

  io.on("connection", (socket: CustomSocket) => {
    const userId = socket.userId!;
    console.log(`User ${userId} connected`);
    socket.join(userId);

    socket.on("SUBSCRIBE_MARKET", (assetId: string) => {
      socket.join(`MARKET_${assetId}`);
      socket.emit("INITIAL_BOOK", getInMemBook(assetId));
    });

    socket.on("PLACE_ORDER", async (data) => {
      try {
        if (!allowEvent(userId)) {
          return socket.emit("ORDER_REJECTED", {
            reason: "RATE_LIMIT_EXCEEDED",
          });
        }

        if (!data?.assetId || !data?.quantity || !data?.side) {
          return socket.emit("ORDER_REJECTED", {
            reason: "INVALID_ORDER",
          });
        }

        const order = await createOrder({
          ...data,
          userId,
        });

        const engineOrder = {
          ...order,
          id: order._id.toString()
        };

        await executeTradeMatching(engineOrder, io);

        io.to(userId).emit("ORDER_CONFIRMED", {
          id: engineOrder.id,
          status: engineOrder.status,
          filledQuantity: engineOrder.filledQuantity,
        });

      } catch (err) {
        const error = err as Error;
        console.error("[PLACE_ORDER] Error:", error.message, "| User:", userId);

        // Map errors to user-friendly messages
        let reason = "ORDER_FAILED";
        let message = "Failed to place order. Please try again.";

        switch (error.message) {
          case "INSUFFICIENT_FUNDS":
            reason = "INSUFFICIENT_FUNDS";
            message = "Insufficient balance. Please add more funds to your wallet.";
            break;
          case "INSUFFICIENT_ASSET":
            reason = "INSUFFICIENT_ASSET";
            message = "You don't have enough of this asset to sell.";
            break;
          case "NO_LIQUIDITY":
            reason = "NO_LIQUIDITY";
            message = "No sellers available for this market order. Try a limit order instead.";
            break;
          case "INSUFFICIENT_LIQUIDITY":
            reason = "INSUFFICIENT_LIQUIDITY";
            message = "Not enough liquidity to fill your order at current prices.";
            break;
          case "MISSING_FIELDS":
            reason = "INVALID_ORDER";
            message = "Invalid order details. Please check your input.";
            break;
          default:
            console.error("[PLACE_ORDER] Unexpected error:", error);
        }

        socket.emit("ORDER_REJECTED", { reason, message });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected`);
    });
  });
};