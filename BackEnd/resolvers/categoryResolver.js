import { pool } from "../helpers/dbHelper.js";

export const categoryResolver = {
    Query: {
        categories: async () => {

            const client = await pool.connect();

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
            } finally {
                client.release();
            }
        },

        category: async (_, { id }) => {

            const client = await pool.connect();

            try {
                const query = {
                    text: "SELECT * FROM category WHERE category_id = $1",
                    values: [id],
                };
                const result = await client.query(query);
                console.log("Result:", result.rows);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to fetch category.");
            } finally {
                client.release();
            }
        },
    },
    Mutation: {
        addCategory: async (_, { admin_id, category }) => {

            const client = await pool.connect();

            try {

                let response = {
                    content: null,
                    type: "",
                    message: "",
                };   

                const query = {
                    text: "SELECT * FROM fn_admin_add_category($1, $2, $3) AS result",
                    values: [admin_id, category.category_name, category.division],
                };

                const result = await client.query(query);
                
                if (result && result.rows.length > 0) {
                    const res = result.rows[0].result;
                    console.log("Added category result: ", res);
                    if (res) {
                    response = {
                        content: res.content,
                        type: res.type,
                        message: res.message,
                    };
                    }
                }

                return response;
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to add new category.");
            } finally {
                await client.end();
            }
        },

        updateCategory: async (_, { admin_id, category_id, category }) => {

            const client = await pool.connect();

            try {

                let response = {
                    type: "",
                    message: "",
                };

                const query = {
                    text: "SELECT * FROM fn_admin_update_category($1, $2, $3, $4) AS result",
                    values: [admin_id, category_id, category.category_name, category.division],
                };

                const result = await client.query(query);
                
                if (result && result.rows.length > 0) {
                    const res = result.rows[0].result;
                    console.log("Updated category result: ", res);
                    if (res) {
                    response = {
                        type: res.type,
                        message: res.message,
                    };
                    }
                }

                return response;
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to update the category.");
            } finally {
                await client.end();
            }
        },

        deleteCategory: async (_, { admin_id, category_id }) => {

            const client = await pool.connect();

            try {

                let response = {
                    type: "",
                    message: "",
                  };

                const query = {
                    text: "SELECT * FROM fn_admin_delete_category($1, $2) AS result",
                    values: [admin_id, category_id],
                };

                const result = await client.query(query);
                
                if (result && result.rows.length > 0) {
                    const res = result.rows[0].result;
                    if (res) {
                      response = {
                        type: res.type,
                        message: res.message,
                      };
                    }
                  }

                return response;
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to delete the category.");
            } finally {
                await client.end();
            }
        },
    },
};
