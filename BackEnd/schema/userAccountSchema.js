export const userAccountSchema = `#graphql
    type User {
        user_id: Int
        user_name: String!
        user_type: String!
    }

    type addUserResponse {
        content: User
        type: String!
        message: String!
    }

    type updateUserResponse {
        type: String!
        message: String!
    }

    type deleteUserResponse {
        type: String!
        message: String!
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
