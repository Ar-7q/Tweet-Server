import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";

import { User } from "./user";
import { GraphqlContext } from "../interfaces";
import JWTService from "../services/jwt";
import { Tweet } from "./tweet";

import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { useServer } from "graphql-ws/use/ws";
import { WebSocketServer } from "ws";
import { createServer } from "http";

export async function initServer() {
  const app = express();

  const httpServer = createServer(app);

  app.use(
    express.json({
      limit: "5mb",
    }),
  );

  app.use(
    express.urlencoded({
      limit: "5mb",
      extended: true,
    }),
  );
  app.use(cors());

  const schema = makeExecutableSchema({
    typeDefs: `
    ${User.types}
    ${Tweet.types}

    type Query {
      ${User.queries}
      ${Tweet.queries}
    }

    type Mutation {
      ${User.mutations}
      ${Tweet.mutations}
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
        ...User.resolvers.queries,
        ...Tweet.resolvers.queries,
      },

      Mutation: {
        ...User.resolvers.mutations,
        ...Tweet.resolvers.mutations,
      },

      Subscription: {
        ...Tweet.subscriptions,
        ...User.subscriptions,
      },

      ...Tweet.resolvers.extraResolvers,
      ...User.resolvers.extraResolvers,
    },
  });

  const graphqlServer = new ApolloServer<GraphqlContext>({
    schema,

    plugins: [
      ApolloServerPluginDrainHttpServer({
        httpServer,
      }),
    ],
  });

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  useServer(
    {
      schema,

      context: async (ctx: any) => {
        const auth = ctx.connectionParams?.authorization as string;

        return {
          user: auth
            ? JWTService.decodeToken(auth.split("Bearer ")[1])
            : undefined,
        };
      },
    },

    wsServer,
  );

  await graphqlServer.start();

  app.use(
    "/graphql",
    expressMiddleware(graphqlServer, {
      context: async ({ req, res }) => {
        return {
          user: req.headers.authorization
            ? JWTService.decodeToken(
                req.headers.authorization.split("Bearer ")[1],
              )
            : undefined,
        };
      },
    }),
  );

  return httpServer;
}
