import { mutations } from "./mutations";
import { queries } from "./queries";
import { resolvers } from "./resolvers";
import { userSubscriptions } from "./subscriptions";
import { types } from "./types";

export const User = {
  types,
  queries,
  resolvers,
  mutations,
  subscriptions: userSubscriptions,
};
