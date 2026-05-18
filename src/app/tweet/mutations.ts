export const mutations = `#graphql

  

    createTweet(payload: CreateTweetData!): Tweet

    uploadImage(image: String!): ImageResponse
    deleteTweet(tweetId: String!): Boolean
    toggleLike(tweetId: String!): Boolean
`;