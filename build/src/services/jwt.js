"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var JWT_SECRET = process.env.JWT_SECRET;
var JWTService = /** @class */ (function () {
    function JWTService() {
    }
    JWTService.generateTokenForUser = function (user) {
        var payload = {
            id: user === null || user === void 0 ? void 0 : user.id,
            email: user === null || user === void 0 ? void 0 : user.email,
        };
        var token = jsonwebtoken_1.default.sign(payload, JWT_SECRET);
        return token;
    };
    JWTService.decodeToken = function (token) {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    };
    return JWTService;
}());
exports.default = JWTService;
