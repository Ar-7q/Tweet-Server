"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = void 0;
const redis_1 = require("../clients/redis");
const rateLimit = async (key, limit, windowInSeconds) => {
    const current = await redis_1.redis.incr(key);
    // FIRST REQUEST
    if (current === 1) {
        await redis_1.redis.expire(key, windowInSeconds);
    }
    // LIMIT EXCEEDED
    if (current > limit) {
        throw new Error("Too many requests. Please slow down.");
    }
};
exports.rateLimit = rateLimit;
