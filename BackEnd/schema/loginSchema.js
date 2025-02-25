export const loginSchema = `#graphql
    type User {
        user_id: Int!
        user_name: String!
        user_type: String!
    }

    type LogInUser {
        message: String!
        user: User
    }
`;
    