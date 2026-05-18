import { prismaClient } from "../clients/db";
import cloudinary from "./cloudinary";

export interface CreateTweetPayload {
  content: string;
  imageURL?: string;
  imagePublicId?: string;
  userId: string;
}

class TweetService {
  public static createTweet(data: CreateTweetPayload) {
    return prismaClient.tweet.create({
      data: {
        content: data.content,
        imageURL: data.imageURL,
        imagePublicId: data.imagePublicId,
        author: { connect: { id: data.userId } },
      },
    });
  }

  public static getAllTweets() {
    return prismaClient.tweet.findMany({ orderBy: { createdAt: "desc" } });
  }

  public static async uploadTweetImage(image: string) {
    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: "ArpitBackend/tweets",
    });

    return {
      imageURL: uploadedImage.secure_url,
      imagePublicId: uploadedImage.public_id,
    };
  }

  public static async deleteTweet(tweetId: string, userId: string) {
    const tweet = await prismaClient.tweet.findUnique({
      where: {
        id: tweetId,
      },
    });

    if (!tweet) {
      throw new Error("Tweet not found");
    }

    // only owner can delete
    if (tweet.authorId !== userId) {
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
  }
}

export default TweetService;
