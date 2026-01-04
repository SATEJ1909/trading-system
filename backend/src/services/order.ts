import OrderModel, { type IOrder } from "../models/order.js";
import WalletModel from "../models/wallet.js";
import PortfolioModel from "../models/portfolio.js";
import mongoose from "mongoose";


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
        if(!newOrder){
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

        if (status === "CANCELLED") {
            const remainingQty = order.quantity - order.filledQuantity;
            const remainingValue = remainingQty * (order.price || 0);

            if (order.side === "BUY") {
                await WalletModel.findOneAndUpdate(
                    { userId: order.userId },
                    { $inc: { availableBalance: remainingValue, lockedBalance: -remainingValue } },
                    { session }
                );
            } else {
                await PortfolioModel.findOneAndUpdate(
                    { userId: order.userId, assetId: order.assetId },
                    { $inc: { availableQuantity: remainingQty, lockedQuantity: -remainingQty } },
                    { session }
                );
            }
        } 
        
        else if (status === "PARTIAL" || status === "FILLED") {
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

        order.status = status;
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

