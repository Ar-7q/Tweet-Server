import axios from "axios";
import { prismaClient } from "../../clients/db";
import JWTService from "../../services/jwt";
import { error } from "node:console";
import { GraphqlContext } from "../../interfaces";

import { User } from "@prisma/client";
import UserService from "../../services/user";

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

    return !!unfollow;
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
  },
};

export const resolvers = { queries, mutations, extraResolvers };
