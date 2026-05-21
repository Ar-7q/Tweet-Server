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
const queries = {
    getAllTweets: () => tweet_1.default.getAllTweets(),
};
const mutations = {
    uploadImage: async (parent, { image }, ctx) => {
        if (!ctx.user || !ctx.user.id) {
            throw new Error("Youre not authenticated");
        }
        return tweet_1.default.uploadTweetImage(image);
    },
    createTweet: async (parent, { payload }, ctx) => {
        if (!ctx.user)
            throw new Error("Youre not authenticated");
        const tweet = await tweet_1.default.createTweet({
            ...payload,
            userId: ctx.user.id,
        });
        await pubsub_1.pubsub.publish("TWEET_CREATED", {
            tweetCreated: tweet,
        });
        return tweet;
    },
    deleteTweet: async (parent, { tweetId }, ctx) => {
        if (!ctx.user || !ctx.user.id) {
            throw new Error("Youre not authenticated");
        }
        const deletedTweet = await tweet_1.default.deleteTweet(tweetId, ctx.user.id);
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
        const updatedTweet = await tweet_1.default.toggleLike(tweetId, ctx.user.id);
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
        const comment = await tweet_1.default.createComment(tweetId, content, ctx.user.id);
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
        const comment = await db_1.prismaClient.comment.findUnique({
            where: {
                id: commentId,
            },
        });
        const deletedComment = await tweet_1.default.deleteComment(commentId, ctx.user.id);
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
        likesCount: (parent) => parent._count.likes,
    },
    Comment: {
        author: (parent) => user_1.default.getUserById(parent.authorId),
    },
};
exports.resolvers = { mutations, extraResolvers, queries };
