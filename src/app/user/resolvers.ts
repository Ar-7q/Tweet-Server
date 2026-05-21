import axios from "axios";
import { prismaClient } from "../../clients/db";
import JWTService from "../../services/jwt";
import { error } from "node:console";
import { GraphqlContext } from "../../interfaces";

import { User } from "@prisma/client";
import UserService from "../../services/user";
import { pubsub } from "../../graphql/pubsub";

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    const resultToken = await UserService.verifyGoogleAuthToken(token);
    return resultToken;
  },

  getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
    // console.log(ctx);
    const id = ctx.user?.id;
    if (!id) return null;
    const user = await UserService.getUserById(id);
    return user;
  },

  getUserById: async (
    parent: any,
    { id }: { id: string },
    ctx: GraphqlContext,
  ) => UserService.getUserById(id),
};

const mutations = {
  followUser: async (
    parent: any,
    { to }: { to: string },
    ctx: GraphqlContext,
  ) => {
    if (!ctx.user?.id) {
      throw new Error("Not authenticated");
    }

    if (ctx.user.id === to) {
      throw new Error("Cannot follow yourself");
    }

    const follow = await prismaClient.follows.create({
      data: {
        followerId: ctx.user.id,
        followingId: to,
      },
    });

    await pubsub.publish("USER_FOLLOWED", {
      userFollowed: {
        userId: to,
        followerId: ctx.user.id,
        type: "follow",
      },
    });

    return !!follow;
  },

  unfollowUser: async (
    parent: any,
    { to }: { to: string },
    ctx: GraphqlContext,
  ) => {
    if (!ctx.user?.id) {
      throw new Error("Not authenticated");
    }

    const unfollow = await prismaClient.follows.delete({
      where: {
        followerId_followingId: {
          followerId: ctx.user.id,
          followingId: to,
        },
      },
    });

    await pubsub.publish("USER_FOLLOWED", {
      userFollowed: {
        userId: to,
        followerId: ctx.user.id,
        type: "unfollow",
      },
    });

    return !!unfollow;
  },

  logoutUser: async (parent: any, args: any, ctx: GraphqlContext) => {
    return true;
  },
};

const extraResolvers = {
  User: {
    tweets: (parent: any) => parent.tweets,

    followers: (parent: User) =>
      prismaClient.follows.findMany({
        where: {
          followingId: parent.id,
        },

        include: {
          follower: true,
        },
      }),

    following: (parent: User) =>
      prismaClient.follows.findMany({
        where: {
          followerId: parent.id,
        },

        include: {
          following: true,
        },
      }),

    recommendedUsers: async (parent: User, _: any, ctx: GraphqlContext) => {
      if (!ctx.user) return [];

      const myFollowings = await prismaClient.follows.findMany({
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

      const recommendedUsers: User[] = [];

      for (const followings of myFollowings) {
        for (const followingOfFollowedUser of followings.following.followers) {
          const suggestedUser = followingOfFollowedUser.follower;

          // skip self
          if (suggestedUser.id === ctx.user.id) {
            continue;
          }

          // skip already followed users
          if (
            myFollowings.findIndex((e) => e.followingId === suggestedUser.id) >=
            0
          ) {
            continue;
          }

          // avoid duplicates
          if (
            recommendedUsers.findIndex((u) => u.id === suggestedUser.id) >= 0
          ) {
            continue;
          }

          recommendedUsers.push(suggestedUser);
        }
      }

      return recommendedUsers;
    },
  },
};

export const resolvers = { queries, mutations, extraResolvers };
