import { gql } from "@apollo/client";

const LOGIN_USER = gql`
  mutation Mutation($userName: String!, $password: String!) {
    userLogin(user_name: $userName, password: $password) {
      type
      message
      token
      user {
        user_id
        user_name
        user_type
      }
    }
  }
`;
export default LOGIN_USER;
