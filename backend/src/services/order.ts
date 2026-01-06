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

interface orderEngine  extends IOrder{
    id : string
}

const orderBook: Record<string, { bids: orderEngine[], asks: orderEngine[] }> = {};
export async function executeTradeMatching(order : orderEngine){
  const { assetId , side , price : targetPrice} = order ;

  if(!order){
    throw new Error("Decrepted order")
  }
  
  if(!orderBook[String(assetId)]){
    orderBook[String(assetId)] = {bids : [] , asks : []}
  }

  const assetBook = orderBook[String(assetId)] ?? { bids: [], asks: [] };

  const potentialMatch = (side == "BUY") ? assetBook.asks : assetBook.bids;

  for(let i=0; i < (potentialMatch?.length ?? 0) && order.filledQuantity < order.quantity ; i++ ){
     const restingOrder = potentialMatch[i];
     
     const isPriceMatch = (side == "BUY") ? (targetPrice == null || targetPrice >= (restingOrder?.price ?? 0)) : ((restingOrder?.price ?? 0) === 0 || (targetPrice ?? 0) <= (restingOrder?.price ?? 0))

     if(isPriceMatch && restingOrder){
        const tradeAmount = Math.min(
            order.quantity - order.filledQuantity ,
            (restingOrder?.quantity ?? 0) - (restingOrder?.filledQuantity ?? 0)
        )

        await updateOrderStatus(order.id , "PARTIAL" , tradeAmount);
        await updateOrderStatus(restingOrder.id , "PARTIAL" , tradeAmount);

        order.filledQuantity += tradeAmount ;
        restingOrder.filledQuantity += tradeAmount ;

        if(restingOrder.filledQuantity == restingOrder.quantity){
            await updateOrderStatus(restingOrder.id , "FILLED" , 0);
            potentialMatch.splice(i , 1);
            i--;
        }
     }

  }
  if(order.filledQuantity == order.quantity){
    await updateOrderStatus(order.id , "FILLED" , 0);
  }else{
     const sideToAdd = (side == "BUY") ? assetBook.bids : assetBook.asks ;
     sideToAdd.push(order);
     sideToAdd.sort((a, b) => (side === "BUY") ? b.price! - a.price! : a.price! - b.price!);
  }
}