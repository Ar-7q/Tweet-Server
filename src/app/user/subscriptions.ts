import { pubsub } from "../../graphql/pubsub";


export const userSubscriptions = {
  userFollowed: {
    subscribe: () =>
      pubsub.asyncIterableIterator(["USER_FOLLOWED"]),
  },
};