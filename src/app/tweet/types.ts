export const types = `#graphql

    type ImageResponse {
        imageURL: String
        imagePublicId: String
    }

    input CreateTweetData {
        content:String!
        imageURL:String
        imagePublicId:String
    }

    type Comment {
        id: ID!
        content: String!
        createdAt: String!
        author: User!
        tweet: Tweet!
    }

    type Tweet {
        id:ID!
        content:String!
        imageURL:String
        imagePublicId:String
        createdAt:String
        author:User
        likesCount:Int
        
        comments:[Comment]
    }

    type Mutation {
        toggleLike(tweetId:String!):Boolean
    }
`;
