export const categorySchema = `#graphql
    type Category {
        category_id: Int!
        category_name: String!
        division: String!
    }

    input AddCategoryInput {
        category_name: String!
        division: String!
    }

    input UpdateCategoryInput {
        category_name: String
        division: String
    }
`;