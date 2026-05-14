"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initServer = initServer;
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const express5_1 = require("@as-integrations/express5");
const user_1 = require("./user");
async function initServer() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    // prismaClient.user.create({
    //     data: {
    //     }
    // })
    const graphqlServer = new server_1.ApolloServer({
        typeDefs: `
            ${user_1.User.types}

            ${user_1.User.queries}
        `,
        resolvers: {
            Query: {
                ...user_1.User.resolvers.queries,
            },
        },
    });
    await graphqlServer.start();
    app.use('/graphql', (0, express5_1.expressMiddleware)(graphqlServer));
    return app;
}
