import client from "../helpers/dbHelper.js";

export const categoryResolver = {
    Query: {
        categories: async () => {
            try {
                const query = {
                    text: "SELECT * FROM category",
                };
                const result = await client.query(query);
                console.log("Result:", result.rows);
                return result.rows;
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to fetch categories.");
            }
        },

        category: async (_, { id }) => {
            try {
                const query = {
                    text: "SELECT * FROM category WHERE category_id = $1",
                    values: [id],
                };
                const result = await client.query(query);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to fetch category.");
            }
        },
    },
    Mutation: {
        addCategory: async (_, { category }) => {
            try {
                const query = {
                    text: "SELECT * FROM fn_admin_add_category($1, $2)",
                    values: [category.category_name, category.division],
                };
                const result = await client.query(query);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to add new category.");
            }
        },

        updateCategory: async (_, { id, category }) => {
            try {
                const query = {
                    text: "SELECT * FROM fn_admin_update_category($1, $2, $3)",
                    values: [id, category.category_name, category.division],
                };
                const result = await client.query(query);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to update the category.");
            }
        },

        deleteCategory: async (_, { id }) => {
            try {
                const query = {
                    text: "SELECT * FROM fn_admin_delete_category($1)",
                    values: [id],
                };
                const result = await client.query(query);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to delete the category.");
            }
        },
    },
};
