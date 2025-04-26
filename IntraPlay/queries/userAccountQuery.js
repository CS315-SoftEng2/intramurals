import { gql } from "@apollo/client";

const GET_USERS = gql`
  query Query {
    users {
      user_id
      user_name
      user_type
    }
  }
`;

export default GET_USERS;
