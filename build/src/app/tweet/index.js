"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tweet = void 0;
var mutations_1 = require("./mutations");
var queries_1 = require("./queries");
var resolvers_1 = require("./resolvers");
var types_1 = require("./types");
exports.Tweet = { types: types_1.types, mutations: mutations_1.mutations, resolvers: resolvers_1.resolvers, queries: queries_1.queries };
