export const categorySchema = `#graphql
    type Category {
        category_id: Int
        category_name: String!
        division: String!
    }

    type addCategoryResponse {
        content: Category
        type: String!
        message: String!
    }

    type updateCategoryResponse {
        type: String!
        message: String!
    }

    type deleteCategoryResponse {
        type: String!
        message: String!
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