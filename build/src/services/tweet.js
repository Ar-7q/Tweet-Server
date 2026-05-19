"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var db_1 = require("../clients/db");
var cloudinary_1 = __importDefault(require("./cloudinary"));
var TweetService = /** @class */ (function () {
    function TweetService() {
    }
    TweetService.createTweet = function (data) {
        return db_1.prismaClient.tweet.create({
            data: {
                content: data.content,
                imageURL: data.imageURL,
                imagePublicId: data.imagePublicId,
                author: { connect: { id: data.userId } },
            },
        });
    };
    TweetService.getAllTweets = function () {
        return db_1.prismaClient.tweet.findMany({
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
    };
    TweetService.uploadTweetImage = function (image) {
        return __awaiter(this, void 0, void 0, function () {
            var uploadedImage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, cloudinary_1.default.uploader.upload(image, {
                            folder: "ArpitBackend/tweets",
                        })];
                    case 1:
                        uploadedImage = _a.sent();
                        return [2 /*return*/, {
                                imageURL: uploadedImage.secure_url,
                                imagePublicId: uploadedImage.public_id,
                            }];
                }
            });
        });
    };
    TweetService.deleteTweet = function (tweetId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var tweet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.prismaClient.tweet.findUnique({
                            where: {
                                id: tweetId,
                            },
                        })];
                    case 1:
                        tweet = _a.sent();
                        if (!tweet) {
                            throw new Error("Tweet not found");
                        }
                        // only owner can delete
                        if (tweet.authorId !== userId) {
                            throw new Error("Unauthorized");
                        }
                        if (!tweet.imagePublicId) return [3 /*break*/, 3];
                        return [4 /*yield*/, cloudinary_1.default.uploader.destroy(tweet.imagePublicId)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: 
                    // delete likes first
                    return [4 /*yield*/, db_1.prismaClient.like.deleteMany({
                            where: {
                                tweetId: tweetId,
                            },
                        })];
                    case 4:
                        // delete likes first
                        _a.sent();
                        // delete comments
                        return [4 /*yield*/, db_1.prismaClient.comment.deleteMany({
                                where: {
                                    tweetId: tweetId,
                                },
                            })];
                    case 5:
                        // delete comments
                        _a.sent();
                        // delete tweet from db
                        return [4 /*yield*/, db_1.prismaClient.tweet.delete({
                                where: {
                                    id: tweetId,
                                },
                            })];
                    case 6:
                        // delete tweet from db
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    TweetService.toggleLike = function (tweetId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var existingLike;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.prismaClient.like.findUnique({
                            where: {
                                userId_tweetId: {
                                    userId: userId,
                                    tweetId: tweetId,
                                },
                            },
                        })];
                    case 1:
                        existingLike = _a.sent();
                        if (!existingLike) return [3 /*break*/, 3];
                        return [4 /*yield*/, db_1.prismaClient.like.delete({
                                where: {
                                    id: existingLike.id,
                                },
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, false];
                    case 3: 
                    // LIKE
                    return [4 /*yield*/, db_1.prismaClient.like.create({
                            data: {
                                userId: userId,
                                tweetId: tweetId,
                            },
                        })];
                    case 4:
                        // LIKE
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    TweetService.createComment = function (tweetId, content, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var latestComment, diff;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.prismaClient.comment.findFirst({
                            where: {
                                authorId: userId,
                            },
                            orderBy: {
                                createdAt: "desc",
                            },
                        })];
                    case 1:
                        latestComment = _a.sent();
                        if (latestComment) {
                            diff = Date.now() - new Date(latestComment.createdAt).getTime();
                            // 5 seconds cooldown
                            if (diff < 5000) {
                                throw new Error("Please wait before commenting again");
                            }
                        }
                        return [2 /*return*/, db_1.prismaClient.comment.create({
                                data: {
                                    content: content,
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
                            })];
                }
            });
        });
    };
    TweetService.deleteComment = function (commentId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var comment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.prismaClient.comment.findUnique({
                            where: {
                                id: commentId,
                            },
                        })];
                    case 1:
                        comment = _a.sent();
                        if (!comment) {
                            throw new Error("Comment not found");
                        }
                        if (comment.authorId !== userId) {
                            throw new Error("Unauthorized");
                        }
                        return [4 /*yield*/, db_1.prismaClient.comment.delete({
                                where: {
                                    id: commentId,
                                },
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    return TweetService;
}());
exports.default = TweetService;
