"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tweetSubscriptions = void 0;
const pubsub_1 = require("../../graphql/pubsub");
exports.tweetSubscriptions = {
    tweetLiked: {
        subscribe: () => pubsub_1.pubsub.asyncIterableIterator(["TWEET_LIKED"]),
    },
    commentAdded: {
        subscribe: () => pubsub_1.pubsub.asyncIterableIterator(["COMMENT_ADDED"]),
    },
    commentDeleted: {
        subscribe: () => pubsub_1.pubsub.asyncIterableIterator(["COMMENT_DELETED"]),
    },
    tweetCreated: {
        subscribe: () => pubsub_1.pubsub.asyncIterableIterator(["TWEET_CREATED"]),
    },
    tweetDeleted: {
        subscribe: () => pubsub_1.pubsub.asyncIterableIterator(["TWEET_DELETED"]),
    },
};
