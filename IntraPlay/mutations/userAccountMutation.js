import { gql } from "@apollo/client";

export const ADD_USER = gql`
  mutation Mutation($useraccount: AddUserInput!, $adminId: Int!) {
    addUserAccount(useraccount: $useraccount, admin_id: $adminId) {
      content {
        user_id
        user_name
        user_type
      }
      type
      message
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser(
    $useraccount: UpdateUserInput!
    $adminId: Int!
    $userId: Int!
  ) {
    updateUserAccount(
      useraccount: $useraccount
      admin_id: $adminId
      user_id: $userId
    ) {
      type
      message
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($adminId: Int!, $userId: Int!) {
    deleteUserAccount(admin_id: $adminId, user_id: $userId) {
      type
      message
    }
  }
`;
