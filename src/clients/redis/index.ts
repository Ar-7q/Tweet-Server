import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_TCP_URL! as string);

redis.on("connect", () => {
  console.log("Redis Connected");
});

redis.on("error", (err) => {
  console.log("Redis Error", err);
});