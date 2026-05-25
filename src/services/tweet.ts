import { prismaClient } from "../clients/db";
import { redis } from "../clients/redis";
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

  public static async getAllTweets() {
    // CHECK CACHE
    const cachedTweets = await redis.get("tweets:feed");

    if (cachedTweets) {
      console.log("TWEETS CACHE HIT");

      return JSON.parse(cachedTweets);
    }

    console.log("TWEETS CACHE MISS");

    const tweets = await prismaClient.tweet.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        _count: {
          select: {
            likes: true,
          },
        },

        author: true,

        comments: {
          include: {
            author: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    // STORE CACHE
    await redis.set("tweets:feed", JSON.stringify(tweets), "EX", 120);

    return tweets;
  }

  // public static async uploadTweetImage(image: string) {
  //   const uploadedImage = await cloudinary.uploader.upload(image, {
  //     folder: "ArpitBackend/tweets",
  //   });

  //   return {
  //     imageURL: uploadedImage.secure_url,
  //     imagePublicId: uploadedImage.public_id,
  //   };
  // }

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

    // delete likes first
    await prismaClient.like.deleteMany({
      where: {
        tweetId: tweetId,
      },
    });

    // delete comments
    await prismaClient.comment.deleteMany({
      where: {
        tweetId: tweetId,
      },
    });

    // delete tweet from db
    try {
      await prismaClient.tweet.delete({
        where: {
          id: tweetId,
        },
      });

      return true;
    } catch (error) {
      console.log("TWEET ALREADY DELETED");

      return false;
    }
  }

  public static async toggleLike(tweetId: string, userId: string) {
    try {
      // CHECK EXISTING LIKE
      const existingLike = await prismaClient.like.findUnique({
        where: {
          userId_tweetId: {
            userId,
            tweetId,
          },
        },
      });

      // UNLIKE
      if (existingLike) {
        await prismaClient.like.delete({
          where: {
            id: existingLike.id,
          },
        });

        return false;
      }

      // LIKE
      await prismaClient.like.create({
        data: {
          userId,
          tweetId,
        },
      });

      return true;
    } catch (error) {
      console.log("LIKE TOGGLE SKIPPED");

      return false;
    }
  }

  public static async createComment(
    tweetId: string,
    content: string,
    userId: string,
  ) {
    const latestComment = await prismaClient.comment.findFirst({
      where: {
        authorId: userId,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    if (latestComment) {
      const diff = Date.now() - new Date(latestComment.createdAt).getTime();

      // 5 seconds cooldown
      if (diff < 5000) {
        throw new Error("Please wait before commenting again");
      }
    }

    return prismaClient.comment.create({
      data: {
        content,

        author: {
          connect: {
            id: userId,
          },
        },

        tweet: {
          connect: {
            id: tweetId,
          },
        },
      },

      include: {
        author: true,
        tweet: true,
      },
    });
  }

  public static async deleteComment(commentId: string, userId: string) {
    const comment = await prismaClient.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.authorId !== userId) {
      throw new Error("Unauthorized");
    }

    try {
      await prismaClient.comment.delete({
        where: {
          id: commentId,
        },
      });

      return true;
    } catch (error) {
      console.log("COMMENT ALREADY DELETED");

      return false;
    }

    return true;
  }
}

export default TweetService;
