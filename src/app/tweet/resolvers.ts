import { Tweet } from "@prisma/client";
import { GraphqlContext } from "../../interfaces";
import UserService from "../../services/user";
import TweetService, { CreateTweetPayload } from "../../services/tweet";
import { prismaClient } from "../../clients/db";

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

    return TweetService.deleteTweet(tweetId, ctx.user.id);
  },

  toggleLike: async (
    parent: any,
    { tweetId }: { tweetId: string },
    ctx: GraphqlContext,
  ) => {
    if (!ctx.user || !ctx.user.id) {
      throw new Error("You need to sign in for liking");
    }

    return TweetService.toggleLike(tweetId, ctx.user.id);
  },

  createComment: async (
    parent: any,
    { tweetId, content }: { tweetId: string; content: string },
    ctx: GraphqlContext,
  ) => {
    if (!ctx.user || !ctx.user.id) {
      throw new Error("Unauthorized");
    }

    return TweetService.createComment(tweetId, content, ctx.user.id);
  },

  deleteComment: async (
    parent: any,
    { commentId }: { commentId: string },
    ctx: GraphqlContext,
  ) => {
    if (!ctx.user || !ctx.user.id) {
      throw new Error("Unauthorized");
    }

    return TweetService.deleteComment(commentId, ctx.user.id);
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
