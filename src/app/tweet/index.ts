import { mutations } from "./mutations";
import { queries } from "./queries";

import { resolvers } from "./resolvers";
import { tweetSubscriptions } from "./subscriptions";
import { types } from "./types";

export const Tweet = {
  types,
  mutations,
  resolvers,
  queries,
  subscriptions: tweetSubscriptions,
};
