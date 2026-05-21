import { pubsub } from "../../graphql/pubsub";

export const tweetSubscriptions = {
  tweetLiked: {
    subscribe: () => pubsub.asyncIterableIterator(["TWEET_LIKED"]),
  },

  commentAdded: {
    subscribe: () => pubsub.asyncIterableIterator(["COMMENT_ADDED"]),
  },
  commentDeleted: {
    subscribe: () => pubsub.asyncIterableIterator(["COMMENT_DELETED"]),
  },

  tweetCreated: {
    subscribe: () => pubsub.asyncIterableIterator(["TWEET_CREATED"]),
  },

  tweetDeleted: {
    subscribe: () => pubsub.asyncIterableIterator(["TWEET_DELETED"]),
  },
};
