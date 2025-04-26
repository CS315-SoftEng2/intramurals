import { gql } from "@apollo/client";

export const ADD_CATEGORY = gql`
  mutation Mutation($category: AddCategoryInput!, $adminId: Int!) {
    addCategory(category: $category, admin_id: $adminId) {
      content {
        category_id
        category_name
        division
      }
      type
      message
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory(
    $category: UpdateCategoryInput!
    $adminId: Int!
    $categoryId: Int!
  ) {
    updateCategory(
      category: $category
      admin_id: $adminId
      category_id: $categoryId
    ) {
      type
      message
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($adminId: Int!, $categoryId: Int!) {
    deleteCategory(admin_id: $adminId, category_id: $categoryId) {
      type
      message
    }
  }
`;
