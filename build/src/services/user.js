"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const db_1 = require("../clients/db");
const jwt_1 = __importDefault(require("./jwt"));
const redis_1 = require("../clients/redis");
class UserService {
    static async verifyGoogleAuthToken(token) {
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
        else {
            await db_1.prismaClient.user.update({
                where: {
                    email: data.email,
                },
                data: {
                    profileImageUrl: data.picture,
                },
            });
        }
        const userIndb = await db_1.prismaClient.user.findUnique({
            where: { email: data.email },
        });
        if (!userIndb)
            throw new Error("user with email not found");
        const userToken = await jwt_1.default.generateTokenForUser(userIndb);
        return userToken;
        // return "ok";
    }
    static async getUserById(id) {
        // CHECK CACHE
        const cachedUser = await redis_1.redis.get(`user:${id}`);
        if (cachedUser) {
            console.log("USER CACHE HIT");
            return JSON.parse(cachedUser);
        }
        console.log("USER CACHE MISS");
        const user = await db_1.prismaClient.user.findUnique({
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
            await redis_1.redis.set(`user:${id}`, JSON.stringify(user), "EX", 300);
        }
        return user;
    }
}
exports.default = UserService;
