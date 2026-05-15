export const queries = `#graphql
  type Query {
    verifyGoogleToken(token: String!): String
    getCurrentUser:User
  }
`;