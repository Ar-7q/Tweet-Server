"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../clients/db");
const redis_1 = require("../clients/redis");
const cloudinary_1 = __importDefault(require("./cloudinary"));
class TweetService {
    static createTweet(data) {
        return db_1.prismaClient.tweet.create({
            data: {
                content: data.content,
                imageURL: data.imageURL,
                imagePublicId: data.imagePublicId,
                author: { connect: { id: data.userId } },
            },
        });
    }
    static async getAllTweets() {
        // CHECK CACHE
        const cachedTweets = await redis_1.redis.get("tweets:feed");
        if (cachedTweets) {
            console.log("TWEETS CACHE HIT");
            return JSON.parse(cachedTweets);
        }
        console.log("TWEETS CACHE MISS");
        const tweets = await db_1.prismaClient.tweet.findMany({
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
        await redis_1.redis.set("tweets:feed", JSON.stringify(tweets), "EX", 120);
        return tweets;
    }
    static async uploadTweetImage(image) {
        const uploadedImage = await cloudinary_1.default.uploader.upload(image, {
            folder: "ArpitBackend/tweets",
        });
        return {
            imageURL: uploadedImage.secure_url,
            imagePublicId: uploadedImage.public_id,
        };
    }
    static async deleteTweet(tweetId, userId) {
        const tweet = await db_1.prismaClient.tweet.findUnique({
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
            await cloudinary_1.default.uploader.destroy(tweet.imagePublicId);
        }
        // delete likes first
        await db_1.prismaClient.like.deleteMany({
            where: {
                tweetId: tweetId,
            },
        });
        // delete comments
        await db_1.prismaClient.comment.deleteMany({
            where: {
                tweetId: tweetId,
            },
        });
        // delete tweet from db
        try {
            await db_1.prismaClient.tweet.delete({
                where: {
                    id: tweetId,
                },
            });
            return true;
        }
        catch (error) {
            console.log("TWEET ALREADY DELETED");
            return false;
        }
    }
    static async toggleLike(tweetId, userId) {
        try {
            // CHECK EXISTING LIKE
            const existingLike = await db_1.prismaClient.like.findUnique({
                where: {
                    userId_tweetId: {
                        userId,
                        tweetId,
                    },
                },
            });
            // UNLIKE
            if (existingLike) {
                await db_1.prismaClient.like.delete({
                    where: {
                        id: existingLike.id,
                    },
                });
                return false;
            }
            // LIKE
            await db_1.prismaClient.like.create({
                data: {
                    userId,
                    tweetId,
                },
            });
            return true;
        }
        catch (error) {
            console.log("LIKE TOGGLE SKIPPED");
            return false;
        }
    }
    static async createComment(tweetId, content, userId) {
        const latestComment = await db_1.prismaClient.comment.findFirst({
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
        return db_1.prismaClient.comment.create({
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
    static async deleteComment(commentId, userId) {
        const comment = await db_1.prismaClient.comment.findUnique({
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
            await db_1.prismaClient.comment.delete({
                where: {
                    id: commentId,
                },
            });
            return true;
        }
        catch (error) {
            console.log("COMMENT ALREADY DELETED");
            return false;
        }
        return true;
    }
}
exports.default = TweetService;
