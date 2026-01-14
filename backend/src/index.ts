import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
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

// CORS - must come before rate limiter
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

app.use("/api/v1/user", UserRouter);
app.use("/api/v1/wallet", WalletRouter);
app.use("/api/v1/assets", assetRouter)

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