export const userAccountSchema = `#graphql
    type User {
        user_id: Int!
        user_name: String!
        user_type: String!
    }

    input AddUserInput {
        user_name: String!
        password: String!
        user_type: String!
    }

    input UpdateUserInput {
        user_name: String
        password: String
        user_type: String
    }

`;
