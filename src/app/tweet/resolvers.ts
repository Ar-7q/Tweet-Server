import { Tweet } from "@prisma/client";

import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";
import cloudinary from "../../services/cloudinary";

interface CreateTweetPayload {
  content: string;
  imageURL?: string;
}

const queries={
    getAllTweets:()=>
        prismaClient.tweet.findMany({orderBy:{createdAt:'desc'}})
}

const mutations = {
  uploadImage: async (
    parent: any,
    { image }: { image: string }
  ) => {

    const uploadedImage =
      await cloudinary.uploader.upload(image, {
        folder: "ArpitBackend/tweets",
      });

    return uploadedImage.secure_url;
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
        author: { connect: { id: ctx.user.id } },
      },
    });

    return tweet;
  },
};

const extraResolvers = {
  Tweet: {
    author: (parent: Tweet) =>
      prismaClient.user.findUnique({ where: { id: parent.authorId } }),
  },
};

export const resolvers = { mutations,extraResolvers,queries };
