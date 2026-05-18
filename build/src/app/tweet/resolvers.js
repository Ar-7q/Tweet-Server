"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.resolvers = void 0;
var user_1 = __importDefault(require("../../services/user"));
var tweet_1 = __importDefault(require("../../services/tweet"));
var queries = {
    getAllTweets: function () { return tweet_1.default.getAllTweets(); },
};
var mutations = {
    uploadImage: function (parent_1, _a, ctx_1) { return __awaiter(void 0, [parent_1, _a, ctx_1], void 0, function (parent, _b, ctx) {
        var image = _b.image;
        return __generator(this, function (_c) {
            if (!ctx.user || !ctx.user.id) {
                throw new Error("Youre not authenticated");
            }
            return [2 /*return*/, tweet_1.default.uploadTweetImage(image)];
        });
    }); },
    createTweet: function (parent_1, _a, ctx_1) { return __awaiter(void 0, [parent_1, _a, ctx_1], void 0, function (parent, _b, ctx) {
        var tweet;
        var payload = _b.payload;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!ctx.user)
                        throw new Error("Youre not authenticated");
                    return [4 /*yield*/, tweet_1.default.createTweet(__assign(__assign({}, payload), { userId: ctx.user.id }))];
                case 1:
                    tweet = _c.sent();
                    return [2 /*return*/, tweet];
            }
        });
    }); },
    deleteTweet: function (parent_1, _a, ctx_1) { return __awaiter(void 0, [parent_1, _a, ctx_1], void 0, function (parent, _b, ctx) {
        var tweetId = _b.tweetId;
        return __generator(this, function (_c) {
            if (!ctx.user || !ctx.user.id) {
                throw new Error("Youre not authenticated");
            }
            return [2 /*return*/, tweet_1.default.deleteTweet(tweetId, ctx.user.id)];
        });
    }); },
};
var extraResolvers = {
    Tweet: {
        author: function (parent) { return user_1.default.getUserById(parent.authorId); },
    },
};
exports.resolvers = { mutations: mutations, extraResolvers: extraResolvers, queries: queries };
