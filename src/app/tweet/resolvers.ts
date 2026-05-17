import { Tweet } from "@prisma/client";

import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";
import cloudinary from "../../services/cloudinary";

interface CreateTweetPayload {
  content: string;
  imageURL?: string;
  imagePublicId?: string;
}

const queries = {
  getAllTweets: () =>
    prismaClient.tweet.findMany({ orderBy: { createdAt: "desc" } }),
};

const mutations = {
  uploadImage: async (
    parent: any,
    { image }: { image: string },
    ctx: GraphqlContext,
  ) => {
    if (!ctx.user || !ctx.user.id) throw new Error("Youre not authenticated");

    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: "ArpitBackend/tweets",
    });

    return {
      imageURL: uploadedImage.secure_url,
      imagePublicId: uploadedImage.public_id,
    };
  },

  createTweet: async (
    parent: any,
    { payload }: { payload: CreateTweetPayload },
    ctx: GraphqlContext,
  ) => {
    if (!ctx.user) throw new Error("Youre not authenticated");
    const tweet = await prismaClient.tweet.create({
      data: {
        content: payload.content,
        imageURL: payload.imageURL,
        imagePublicId: payload.imagePublicId,

        author: {
          connect: {
            id: ctx.user.id,
          },
        },
      },
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

    const tweet = await prismaClient.tweet.findUnique({
      where: {
        id: tweetId,
      },
    });

    if (!tweet) {
      throw new Error("Tweet not found");
    }

    // only owner can delete
    if (tweet.authorId !== ctx.user.id) {
      throw new Error("Unauthorized");
    }

    // delete image from cloudinary
    if (tweet.imagePublicId) {
      await cloudinary.uploader.destroy(tweet.imagePublicId);
    }

    // delete tweet from db
    await prismaClient.tweet.delete({
      where: {
        id: tweetId,
      },
    });

    return true;
  },
};

const extraResolvers = {
  Tweet: {
    author: (parent: Tweet) =>
      prismaClient.user.findUnique({ where: { id: parent.authorId } }),
  },
};

export const resolvers = { mutations, extraResolvers, queries };
