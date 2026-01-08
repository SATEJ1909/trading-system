import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import cors from 'cors';
import UserRouter from './routes/user.js';
import WalletRouter from './routes/wallet.js';
import assetRouter from './routes/asset.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupSocketService } from './socketserver/socket.js';
import { initializeMatchingEngine } from './services/order.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*" } 
});

app.use(express.json());
app.use(cors());

app.use("/api/v1/user", UserRouter);
app.use("/api/v1/wallet", WalletRouter);
app.use("/api/v1/assets" , assetRouter)

const PORT = process.env.PORT || 3000;

async function main() {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log("Connected");

    
        await initializeMatchingEngine();

        setupSocketService(io);

        httpServer.listen(PORT, () => {
            console.log(` Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
    }
}

main();