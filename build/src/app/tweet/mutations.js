"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutations = void 0;
exports.mutations = "#graphql\n\n  \n\n    createTweet(payload: CreateTweetData!): Tweet\n\n    uploadImage(image: String!): ImageResponse\n    deleteTweet(tweetId: String!): Boolean\n    toggleLike(tweetId: String!): Boolean\n    createComment(tweetId:String!,content:String!):Comment\n";
