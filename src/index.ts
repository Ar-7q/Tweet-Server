import { initServer } from "./app";
import * as dotenv from "dotenv";

dotenv.config();

async function init() {
  const httpServer = await initServer();

  httpServer.listen(7000, () => {
    console.log("Server started at port:7000");
  });
}

init();
