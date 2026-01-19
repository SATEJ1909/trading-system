import rateLimit, { type Options } from "express-rate-limit";
import type { Request } from "express";

// Custom key generator that prioritizes userId over IP, with proper IPv6 handling
const createKeyGenerator = (defaultKeyGenerator: Options["keyGenerator"]): Options["keyGenerator"] => {
    return (req, res) => {
        // If user is authenticated, use their userId
        if (req.userId) {
            return req.userId;
        }
        // Fall back to IP-based limiting using the default generator (handles IPv6)
        return defaultKeyGenerator!(req, res);
    };
};

// Rate limiter for addMoney endpoint: 5 requests per 15 minutes per user
export const addMoneyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        success: false,
        message: "Too many add money requests. Please try again after 15 minutes.",
    },
    keyGenerator: createKeyGenerator((req) => req.ip || "anonymous"),
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
});

// Rate limiter for airdrop endpoint: 3 requests per hour per user (stricter)
export const airdropLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        success: false,
        message: "Too many airdrop requests. Please try again after 1 hour.",
    },
    keyGenerator: createKeyGenerator((req) => req.ip || "anonymous"),
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
});
