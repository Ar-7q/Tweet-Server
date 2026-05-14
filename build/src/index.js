"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
async function init() {
    const app = await (0, app_1.initServer)();
    app.listen(7000, () => console.log(`Server started at port:7000`));
}
init();
