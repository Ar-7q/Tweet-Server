"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
exports.redis = new ioredis_1.default(process.env.REDIS_TCP_URL);
exports.redis.on("connect", () => {
    console.log("Redis Connected");
});
exports.redis.on("error", (err) => {
    console.log("Redis Error", err);
});
