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

    type Tweet {
        id:ID!
        content:String!
        imageURL:String
        imagePublicId:String
        createdAt:String
        author:User
    }
`;
