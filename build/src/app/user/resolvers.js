"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const axios_1 = __importDefault(require("axios"));
const db_1 = require("../../clients/db");
const jwt_1 = __importDefault(require("../../services/jwt"));
const queries = {
    verifyGoogleToken: async (parent, { token }) => {
        const googleToken = token;
        const googleOauthUrl = new URL("https://oauth2.googleapis.com/tokeninfo");
        googleOauthUrl.searchParams.set("id_token", googleToken);
        const { data } = await axios_1.default.get(googleOauthUrl.toString(), {
            responseType: "json",
        });
        // console.log(data);
        const user = await db_1.prismaClient.user.findUnique({
            where: { email: data.email },
        });
        if (!user) {
            await db_1.prismaClient.user.create({
                data: {
                    email: data.email,
                    firstName: data.given_name,
                    lastName: data.family_name,
                    profileImageUrl: data.picture,
                },
            });
        }
        const userIndb = await db_1.prismaClient.user.findUnique({
            where: { email: data.email },
        });
        if (!userIndb)
            throw new Error('user with email not found');
        const userToken = await jwt_1.default.generateTokenForUser(userIndb);
        return userToken;
        // return "ok";
    },
};
exports.resolvers = {
    queries,
};
