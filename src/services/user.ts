import axios from "axios";
import { prismaClient } from "../clients/db";
import JWTService from "./jwt";
import { redis } from "../clients/redis";

interface GoogleTokenRes {
  iss?: string;
  nbf?: string;
  aud?: string;
  sub?: string;
  email: string;
  email_verified: string;
  azp?: string;
  name?: string;
  picture?: string;
  given_name: string;
  family_name?: string;
  iat?: string;
  exp?: string;
  jti?: string;
  alg?: string;
  kid?: string;
  typ?: string;
}

class UserService {
  public static async verifyGoogleAuthToken(token: string) {
    const googleToken = token;
    const googleOauthUrl = new URL("https://oauth2.googleapis.com/tokeninfo");
    googleOauthUrl.searchParams.set("id_token", googleToken);

    const { data } = await axios.get<GoogleTokenRes>(
      googleOauthUrl.toString(),
      {
        responseType: "json",
      },
    );
    // console.log(data);

    const user = await prismaClient.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      await prismaClient.user.create({
        data: {
          email: data.email,
          firstName: data.given_name,
          lastName: data.family_name,
          profileImageUrl: data.picture,
        },
      });
    } else {
      await prismaClient.user.update({
        where: {
          email: data.email,
        },
        data: {
          profileImageUrl: data.picture,
        },
      });
    }
    const userIndb = await prismaClient.user.findUnique({
      where: { email: data.email },
    });

    if (!userIndb) throw new Error("user with email not found");

    const userToken = await JWTService.generateTokenForUser(userIndb);
    return userToken;
    // return "ok";
  }

  public static async getUserById(id: string) {
    // CHECK CACHE
    const cachedUser = await redis.get(`user:${id}`);

    if (cachedUser) {
      console.log("USER CACHE HIT");

      return JSON.parse(cachedUser);
    }

    console.log("USER CACHE MISS");

    const user = await prismaClient.user.findUnique({
      where: { id },

      include: {
        followers: {
          include: {
            follower: true,
          },
        },

        following: {
          include: {
            following: true,
          },
        },

        tweets: {
          include: {
            author: true,

            comments: {
              include: {
                author: true,
              },

              orderBy: {
                createdAt: "desc",
              },
            },

            _count: {
              select: {
                likes: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    // STORE CACHE
    if (user) {
      await redis.set(`user:${id}`, JSON.stringify(user), "EX", 300);
    }

    return user;
  }
}

export default UserService;
