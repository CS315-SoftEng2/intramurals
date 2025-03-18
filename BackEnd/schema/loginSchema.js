export const loginSchema = `#graphql
type User {
    user_id: Int!
    user_name: String!
    user_type: String!
}

type loginResponse {
    type: String!
    message: String!
    token: String
}

input InputLogIn {
    user_name: String!
    password: String!
}
`;
    