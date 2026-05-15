import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";
import { prismaClient } from "../clients/db";
import { User } from "./user";
import { GraphqlContext } from "../interfaces";
import JWTService from "../services/jwt";

export async function initServer() {
  const app = express();

  app.use(express.json());
  app.use(cors());

  // prismaClient.user.create({
  //     data: {

  //     }
  // })

  const graphqlServer = new ApolloServer<GraphqlContext>({
    typeDefs: `
            ${User.types}

            ${User.queries}
        `,
    resolvers: {
      Query: {
        ...User.resolvers.queries,
      },
    },
  });

  await graphqlServer.start();

  app.use(
    "/graphql",
    expressMiddleware(graphqlServer, {
      context: async ({ req, res }) => {
        return {
          user: req.headers.authorization
            ? JWTService.decodeToken(req.headers.authorization.split('Bearer ')[1])
            : undefined,
        };
      },
    }),
  );

  return app;
}
