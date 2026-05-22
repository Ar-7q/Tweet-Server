import { Tweet } from "@prisma/client";
import { GraphqlContext } from "../../interfaces";
import UserService from "../../services/user";
import TweetService, { CreateTweetPayload } from "../../services/tweet";
import { prismaClient } from "../../clients/db";
import { pubsub } from "../../graphql/pubsub";
import { redis } from "../../clients/redis";

const queries = {
  getAllTweets: () => TweetService.getAllTweets(),
};

const mutations = {
  uploadImage: async (
    parent: any,
    { image }: { image: string },
    ctx: GraphqlContext,
  ) => {
    if (!ctx.user || !ctx.user.id) {
      throw new Error("Youre not authenticated");
    }

    return TweetService.uploadTweetImage(image);
  },

  createTweet: async (
    parent: any,
    { payload }: { payload: CreateTweetPayload },
    ctx: GraphqlContext,
  ) => {
    if (!ctx.user) throw new Error("Youre not authenticated");
    const tweet = await TweetService.createTweet({
      ...payload,
      userId: ctx.user.id,
    });

    await redis.del("tweets:feed");
    await redis.del(`user:${ctx.user.id}`);

    await pubsub.publish("TWEET_CREATED", {
      tweetCreated: tweet,
    });

    return tweet;
  },

  deleteTweet: async (
    parent: any,
    { tweetId }: { tweetId: string },
    ctx: GraphqlContext,
  ) => {
    if (!ctx.user || !ctx.user.id) {
      throw new Error("Youre not authenticated");
    }

    const deletedTweet = await TweetService.deleteTweet(tweetId, ctx.user.id);
    await redis.del("tweets:feed");
    await redis.del(`user:${ctx.user.id}`);

    await pubsub.publish("TWEET_DELETED", {
      tweetDeleted: {
        tweetId,
      },
    });

    return deletedTweet;
  },

  toggleLike: async (
    parent: any,
    { tweetId }: { tweetId: string },
    ctx: GraphqlContext,
  ) => {
    if (!ctx.user || !ctx.user.id) {
      throw new Error("You need to sign in for liking");
    }

    const updatedTweet = await TweetService.toggleLike(tweetId, ctx.user.id);
    await redis.del("tweets:feed");
    await redis.del(`user:${ctx.user.id}`);

    const likesCount = await prismaClient.like.count({
      where: {
        tweetId,
      },
    });

    await pubsub.publish("TWEET_LIKED", {
      tweetLiked: {
        tweetId,
        likesCount,
      },
    });

    return updatedTweet;
  },

  createComment: async (
    parent: any,
    { tweetId, content }: { tweetId: string; content: string },
    ctx: GraphqlContext,
  ) => {
    if (!ctx.user || !ctx.user.id) {
      throw new Error("Unauthorized");
    }

    const comment = await TweetService.createComment(
      tweetId,
      content,
      ctx.user.id,
    );
    await redis.del("tweets:feed");
    await redis.del(`user:${ctx.user.id}`);

    await pubsub.publish("COMMENT_ADDED", {
      commentAdded: {
        tweetId,
        comment,
      },
    });

    return comment;
  },

  deleteComment: async (
    parent: any,
    { commentId }: { commentId: string },
    ctx: GraphqlContext,
  ) => {
    if (!ctx.user || !ctx.user.id) {
      throw new Error("Unauthorized");
    }

    const comment = await prismaClient.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    const deletedComment = await TweetService.deleteComment(
      commentId,
      ctx.user.id,
    );

    await redis.del("tweets:feed");
    await redis.del(`user:${ctx.user.id}`);

    await pubsub.publish("COMMENT_DELETED", {
      commentDeleted: {
        tweetId: comment?.tweetId,
        commentId,
      },
    });

    return deletedComment;
  },
};

const extraResolvers = {
  Tweet: {
    likesCount: (parent: any) => parent._count.likes,
  },
  Comment: {
    author: (parent: any) => UserService.getUserById(parent.authorId),
  },
};

export const resolvers = { mutations, extraResolvers, queries };
