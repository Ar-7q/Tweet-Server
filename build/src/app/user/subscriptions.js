"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSubscriptions = void 0;
const pubsub_1 = require("../../graphql/pubsub");
exports.userSubscriptions = {
    userFollowed: {
        subscribe: () => pubsub_1.pubsub.asyncIterableIterator(["USER_FOLLOWED"]),
    },
};
