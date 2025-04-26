import { gql } from "@apollo/client";

const GET_CATEGORIES = gql`
  query Categories {
    categories {
      category_id
      category_name
      division
    }
  }
`;

export default GET_CATEGORIES;
