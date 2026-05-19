export const types = `#graphql
  type User {
    id: ID!
    firstName: String!
    lastName: String
    email: String!
    profileImageUrl: String

    tweets:[Tweet]

    followers:[Follows]
    following:[Follows]
  }

  type Follows {
    id: ID!

    follower: User
    following: User
  }
`;
