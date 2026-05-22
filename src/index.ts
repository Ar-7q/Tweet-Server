import * as dotenv from "dotenv";

dotenv.config();

import { initServer } from "./app";
import { redis } from "./clients/redis";

async function testRedis() {
  await redis.set("test", "hello");

  const data = await redis.get("test");

  console.log(data);
}

async function init() {
  await testRedis();

  const httpServer = await initServer();

  httpServer.listen(7000, () => {
    console.log("Server started at port:7000");
  });
}

init();