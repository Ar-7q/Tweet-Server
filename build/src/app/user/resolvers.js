"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const db_1 = require("../../clients/db");
const user_1 = __importDefault(require("../../services/user"));
const pubsub_1 = require("../../graphql/pubsub");
const queries = {
    verifyGoogleToken: async (parent, { token }) => {
        const resultToken = await user_1.default.verifyGoogleAuthToken(token);
        return resultToken;
    },
    getCurrentUser: async (parent, args, ctx) => {
        // console.log(ctx);
        const id = ctx.user?.id;
        if (!id)
            return null;
        const user = await user_1.default.getUserById(id);
        return user;
    },
    getUserById: async (parent, { id }, ctx) => user_1.default.getUserById(id),
};
const mutations = {
    followUser: async (parent, { to }, ctx) => {
        if (!ctx.user?.id) {
            throw new Error("Not authenticated");
        }
        if (ctx.user.id === to) {
            throw new Error("Cannot follow yourself");
        }
        const follow = await db_1.prismaClient.follows.create({
            data: {
                followerId: ctx.user.id,
                followingId: to,
            },
        });
        await pubsub_1.pubsub.publish("USER_FOLLOWED", {
            userFollowed: {
                userId: to,
                followerId: ctx.user.id,
                type: "follow",
            },
        });
        return !!follow;
    },
    unfollowUser: async (parent, { to }, ctx) => {
        if (!ctx.user?.id) {
            throw new Error("Not authenticated");
        }
        const unfollow = await db_1.prismaClient.follows.delete({
            where: {
                followerId_followingId: {
                    followerId: ctx.user.id,
                    followingId: to,
                },
            },
        });
        await pubsub_1.pubsub.publish("USER_FOLLOWED", {
            userFollowed: {
                userId: to,
                followerId: ctx.user.id,
                type: "unfollow",
            },
        });
        return !!unfollow;
    },
    logoutUser: async (parent, args, ctx) => {
        return true;
    },
};
const extraResolvers = {
    User: {
        tweets: (parent) => parent.tweets,
        followers: (parent) => db_1.prismaClient.follows.findMany({
            where: {
                followingId: parent.id,
            },
            include: {
                follower: true,
            },
        }),
        following: (parent) => db_1.prismaClient.follows.findMany({
            where: {
                followerId: parent.id,
            },
            include: {
                following: true,
            },
        }),
        recommendedUsers: async (parent, _, ctx) => {
            if (!ctx.user)
                return [];
            const myFollowings = await db_1.prismaClient.follows.findMany({
                where: {
                    followerId: ctx.user.id,
                },
                include: {
                    following: {
                        include: {
                            followers: {
                                include: {
                                    follower: true,
                                },
                            },
                        },
                    },
                },
            });
            const recommendedUsers = [];
            for (const followings of myFollowings) {
                for (const followingOfFollowedUser of followings.following.followers) {
                    const suggestedUser = followingOfFollowedUser.follower;
                    // skip self
                    if (suggestedUser.id === ctx.user.id) {
                        continue;
                    }
                    // skip already followed users
                    if (myFollowings.findIndex((e) => e.followingId === suggestedUser.id) >=
                        0) {
                        continue;
                    }
                    // avoid duplicates
                    if (recommendedUsers.findIndex((u) => u.id === suggestedUser.id) >= 0) {
                        continue;
                    }
                    recommendedUsers.push(suggestedUser);
                }
            }
            return recommendedUsers;
        },
    },
};
exports.resolvers = { queries, mutations, extraResolvers };
