"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutations = void 0;
exports.mutations = `#graphql

  

    createTweet(payload: CreateTweetData!): Tweet

    uploadImage(image: String!): ImageResponse
    deleteTweet(tweetId: String!): Boolean
    toggleLike(tweetId: String!): Boolean
    createComment(tweetId:String!,content:String!):Comment
    deleteComment(commentId:String!):Boolean
`;
