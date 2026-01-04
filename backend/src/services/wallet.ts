import WalletModel from "../models/wallet.js";

export async function getWallet(userId : string) : Promise<unknown> {
    const wallet = await WalletModel.findOne({ userId });
    if (!wallet) {
        throw new Error("Wallet not found");
    }
    return wallet;
}

export async function lockFunds(userId : string , amount : number) : Promise<unknown>  {
    let wallet = await WalletModel.findByIdAndUpdate({userId , availableBalance: { $gte: amount }},
        {$inc : {
            availableBalance : -amount,
            lockedBalance : amount 
        }},
        { new: true }
    )

    if(!wallet){
        throw new Error("INSUFFICIENT_BALANCE_OR_NOT_FOUND");
    }

    return wallet ;
}

export async function unlockFunds(userId : string , amount : number) : Promise<unknown> {
    const wallet = await WalletModel.findByIdAndUpdate({userId , lockedBalance: { $gte: amount }},
        {$inc : {
            availableBalance : amount ,
            lockedBalance : -amount
        }},
        {new : true}
    )

    if(!wallet){
        throw new Error("UNABLE_TO_UNLOCK_FUNDS");
    }

    return wallet ;
}