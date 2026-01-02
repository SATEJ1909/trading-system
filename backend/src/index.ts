import express from 'express'
import dotenv from 'dotenv'
dotenv.config();
import mongoose from 'mongoose'
import cors from 'cors'
import UserRouter from './routes/user.js';
import WalletRouter from './routes/wallet.js';
const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1/user" , UserRouter);
app.use("/api/v1/wallet" , WalletRouter);
const PORT = process.env.PORT || 3000

async function main(){
    await mongoose.connect(process.env.DATABASE_URL as string)
    app.listen(PORT , ()=>{
        console.log(`Server running on port ${PORT}`)
    })
}

main();