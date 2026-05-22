"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const user_1 = __importDefault(require("../../services/user"));
const tweet_1 = __importDefault(require("../../services/tweet"));
const db_1 = require("../../clients/db");
const pubsub_1 = require("../../graphql/pubsub");
const redis_1 = require("../../clients/redis");
const rateLimit_1 = require("../../services/rateLimit");
const queries = {
    getAllTweets: () => tweet_1.default.getAllTweets(),
};
const mutations = {
    uploadImage: async (parent, { image }, ctx) => {
        if (!ctx.user || !ctx.user.id) {
            throw new Error("Youre not authenticated");
        }
        await (0, rateLimit_1.rateLimit)(`upload:${ctx.user.id}`, 10, 60);
        return tweet_1.default.uploadTweetImage(image);
    },
    createTweet: async (parent, { payload }, ctx) => {
        if (!ctx.user)
            throw new Error("Youre not authenticated");
        await (0, rateLimit_1.rateLimit)(`tweet:${ctx.user.id}`, 5, 60);
        const tweet = await tweet_1.default.createTweet({
            ...payload,
            userId: ctx.user.id,
        });
        await redis_1.redis.del("tweets:feed");
        await redis_1.redis.del(`user:${ctx.user.id}`);
        await pubsub_1.pubsub.publish("TWEET_CREATED", {
            tweetCreated: tweet,
        });
        return tweet;
    },
    deleteTweet: async (parent, { tweetId }, ctx) => {
        if (!ctx.user || !ctx.user.id) {
            throw new Error("Youre not authenticated");
        }
        await (0, rateLimit_1.rateLimit)(`delete-tweet:${ctx.user.id}`, 10, 30);
        const deletedTweet = await tweet_1.default.deleteTweet(tweetId, ctx.user.id);
        await redis_1.redis.del("tweets:feed");
        await redis_1.redis.del(`user:${ctx.user.id}`);
        await pubsub_1.pubsub.publish("TWEET_DELETED", {
            tweetDeleted: {
                tweetId,
            },
        });
        return deletedTweet;
    },
    toggleLike: async (parent, { tweetId }, ctx) => {
        if (!ctx.user || !ctx.user.id) {
            throw new Error("You need to sign in for liking");
        }
        await (0, rateLimit_1.rateLimit)(`like:${ctx.user.id}`, 20, 10);
        const updatedTweet = await tweet_1.default.toggleLike(tweetId, ctx.user.id);
        await redis_1.redis.del("tweets:feed");
        const likesCount = await db_1.prismaClient.like.count({
            where: {
                tweetId,
            },
        });
        await pubsub_1.pubsub.publish("TWEET_LIKED", {
            tweetLiked: {
                tweetId,
                likesCount,
            },
        });
        return updatedTweet;
    },
    createComment: async (parent, { tweetId, content }, ctx) => {
        if (!ctx.user || !ctx.user.id) {
            throw new Error("Unauthorized");
        }
        await (0, rateLimit_1.rateLimit)(`comment:${ctx.user.id}`, 5, 20);
        const comment = await tweet_1.default.createComment(tweetId, content, ctx.user.id);
        await redis_1.redis.del("tweets:feed");
        await pubsub_1.pubsub.publish("COMMENT_ADDED", {
            commentAdded: {
                tweetId,
                comment,
            },
        });
        return comment;
    },
    deleteComment: async (parent, { commentId }, ctx) => {
        if (!ctx.user || !ctx.user.id) {
            throw new Error("Unauthorized");
        }
        await (0, rateLimit_1.rateLimit)(`delete-comment:${ctx.user.id}`, 15, 30);
        const comment = await db_1.prismaClient.comment.findUnique({
            where: {
                id: commentId,
            },
        });
        const deletedComment = await tweet_1.default.deleteComment(commentId, ctx.user.id);
        await redis_1.redis.del("tweets:feed");
        await pubsub_1.pubsub.publish("COMMENT_DELETED", {
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
        likesCount: (parent) => parent?._count?.likes || 0,
    },
    Comment: {
        author: (parent) => parent?.authorId ? user_1.default.getUserById(parent.authorId) : null,
    },
};
exports.resolvers = { mutations, extraResolvers, queries };
