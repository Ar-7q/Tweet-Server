import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import bodyParser from 'body-parser';
import { prismaClient } from '../clients/db';


export async function initServer() {
    const app = express()
    app.use(express.json())

//    prismaClient.user.create({
//     data:{
        
//     }
//    })

    const graphqlServer = new ApolloServer({
        typeDefs: `
        type Query {
            sayHello : String
        }
    `,
        resolvers: {
            Query: {
                sayHello: () => `Hello from graphql server`
            }
        },
    })

    await graphqlServer.start()

    app.use('/graphql', expressMiddleware(graphqlServer))

    return app
}