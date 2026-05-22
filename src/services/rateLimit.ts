import { redis } from "../clients/redis";


export const rateLimit = async (
  key: string,
  limit: number,
  windowInSeconds: number,
) => {
  const current = await redis.incr(key);

  // FIRST REQUEST
  if (current === 1) {
    await redis.expire(key, windowInSeconds);
  }

  // LIMIT EXCEEDED
  if (current > limit) {
    throw new Error("Too many requests. Please slow down.");
  }
};