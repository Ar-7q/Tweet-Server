"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
exports.types = `#graphql
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
