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
exports.resolvers = void 0;
var axios_1 = __importDefault(require("axios"));
var db_1 = require("../../clients/db");
var jwt_1 = __importDefault(require("../../services/jwt"));
var queries = {
    verifyGoogleToken: function (parent_1, _a) { return __awaiter(void 0, [parent_1, _a], void 0, function (parent, _b) {
        var googleToken, googleOauthUrl, data, user, userIndb, userToken;
        var token = _b.token;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    googleToken = token;
                    googleOauthUrl = new URL("https://oauth2.googleapis.com/tokeninfo");
                    googleOauthUrl.searchParams.set("id_token", googleToken);
                    return [4 /*yield*/, axios_1.default.get(googleOauthUrl.toString(), {
                            responseType: "json",
                        })];
                case 1:
                    data = (_c.sent()).data;
                    return [4 /*yield*/, db_1.prismaClient.user.findUnique({
                            where: { email: data.email },
                        })];
                case 2:
                    user = _c.sent();
                    if (!!user) return [3 /*break*/, 4];
                    return [4 /*yield*/, db_1.prismaClient.user.create({
                            data: {
                                email: data.email,
                                firstName: data.given_name,
                                lastName: data.family_name,
                                profileImageUrl: data.picture,
                            },
                        })];
                case 3:
                    _c.sent();
                    _c.label = 4;
                case 4: return [4 /*yield*/, db_1.prismaClient.user.findUnique({
                        where: { email: data.email },
                    })];
                case 5:
                    userIndb = _c.sent();
                    if (!userIndb)
                        throw new Error('user with email not found');
                    return [4 /*yield*/, jwt_1.default.generateTokenForUser(userIndb)];
                case 6:
                    userToken = _c.sent();
                    return [2 /*return*/, userToken
                        // return "ok";
                    ];
            }
        });
    }); },
};
exports.resolvers = {
    queries: queries,
};
