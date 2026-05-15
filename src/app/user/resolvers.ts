import axios from "axios";
import { prismaClient } from "../../clients/db";
import JWTService from "../../services/jwt";
import { error } from "node:console";
import { GraphqlContext } from "../../interfaces";

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

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
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
  },
  getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
    // console.log(ctx);
    const id = ctx.user?.id;
    if (!id) return null;
    const user = await prismaClient.user.findUnique({ where: { id } });
    return user;
  },
};

export const resolvers = {
  queries,
};
