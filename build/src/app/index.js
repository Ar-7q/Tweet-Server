"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initServer = initServer;
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const express5_1 = require("@as-integrations/express5");
const cors_1 = __importDefault(require("cors"));
const user_1 = require("./user");
const jwt_1 = __importDefault(require("../services/jwt"));
const tweet_1 = require("./tweet");
const schema_1 = require("@graphql-tools/schema");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const ws_1 = require("graphql-ws/use/ws");
const ws_2 = require("ws");
const http_1 = require("http");
async function initServer() {
    const app = (0, express_1.default)();
    const httpServer = (0, http_1.createServer)(app);
    app.use(express_1.default.json({
        limit: "5mb",
    }));
    app.use(express_1.default.urlencoded({
        limit: "5mb",
        extended: true,
    }));
    app.use((0, cors_1.default)());
    const schema = (0, schema_1.makeExecutableSchema)({
        typeDefs: `
    ${user_1.User.types}
    ${tweet_1.Tweet.types}

    type Query {
      ${user_1.User.queries}
      ${tweet_1.Tweet.queries}
    }

    type Mutation {
      ${user_1.User.mutations}
      ${tweet_1.Tweet.mutations}
    }

   type Subscription {
  tweetLiked: TweetLikeEvent

  commentAdded: CommentEvent
  commentDeleted: CommentDeleteEvent

  tweetCreated: Tweet
  tweetDeleted: TweetDeleteEvent

  userFollowed: FollowEvent
  
}
  `,
        resolvers: {
            Query: {
                ...user_1.User.resolvers.queries,
                ...tweet_1.Tweet.resolvers.queries,
            },
            Mutation: {
                ...user_1.User.resolvers.mutations,
                ...tweet_1.Tweet.resolvers.mutations,
            },
            Subscription: {
                ...tweet_1.Tweet.subscriptions,
                ...user_1.User.subscriptions,
            },
            ...tweet_1.Tweet.resolvers.extraResolvers,
            ...user_1.User.resolvers.extraResolvers,
        },
    });
    const graphqlServer = new server_1.ApolloServer({
        schema,
        plugins: [
            (0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({
                httpServer,
            }),
        ],
    });
    const wsServer = new ws_2.WebSocketServer({
        server: httpServer,
        path: "/graphql",
    });
    (0, ws_1.useServer)({
        schema,
        context: async (ctx) => {
            const auth = ctx.connectionParams?.authorization;
            return {
                user: auth
                    ? jwt_1.default.decodeToken(auth.split("Bearer ")[1])
                    : undefined,
            };
        },
    }, wsServer);
    await graphqlServer.start();
    app.use("/graphql", (0, express5_1.expressMiddleware)(graphqlServer, {
        context: async ({ req, res }) => {
            return {
                user: req.headers.authorization
                    ? jwt_1.default.decodeToken(req.headers.authorization.split("Bearer ")[1])
                    : undefined,
            };
        },
    }));
    return httpServer;
}
