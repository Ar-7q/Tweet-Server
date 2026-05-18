"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = void 0;
exports.types = "#graphql\n\n    type ImageResponse {\n        imageURL: String\n        imagePublicId: String\n    }\n\n    input CreateTweetData {\n        content:String!\n        imageURL:String\n        imagePublicId:String\n    }\n\n    type Comment {\n        id: ID!\n        content: String!\n        createdAt: String!\n        author: User!\n        tweet: Tweet!\n    }\n\n    type Tweet {\n        id:ID!\n        content:String!\n        imageURL:String\n        imagePublicId:String\n        createdAt:String\n        author:User\n        likesCount:Int\n        \n        comments:[Comment]\n    }\n\n    type Mutation {\n        toggleLike(tweetId:String!):Boolean\n    }\n";
