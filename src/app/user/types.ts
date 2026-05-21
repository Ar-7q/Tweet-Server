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

    recommendedUsers:[User]
  }

  type Follows {
    id: ID!

    follower: User
    following: User
  }

 type FollowEvent {
  userId: ID!
  followerId: ID!
  type: String!
}
`;
