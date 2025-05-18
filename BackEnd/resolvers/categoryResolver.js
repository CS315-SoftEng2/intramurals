import { pool } from "../helpers/dbHelper.js";

// Handles category-related queries and mutations.
export const categoryResolver = {
  Query: {
    // Gets all categories from the database.
    categories: async () => {
      const client = await pool.connect();

      try {
        // Queries all categories.
        const query = { text: "SELECT * FROM category" };
        const result = await client.query(query);

        // Returns the category list.
        return result.rows;
      } catch (err) {
        // Logs and throws error.
        console.error("Error:", err);
        throw new Error("Failed to fetch categories.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },

    // Gets a category by ID.
    category: async (_, { id }) => {
      const client = await pool.connect();

      try {
        // Queries a category by ID.
        const query = {
          text: "SELECT * FROM category WHERE category_id = $1",
          values: [id],
        };
        const result = await client.query(query);

        // Returns the category.
        return result.rows[0];
      } catch (err) {
        // Logs and throws error.
        console.error("Error:", err);
        throw new Error("Failed to fetch category.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },
  },
  Mutation: {
    // Adds a new category.
    addCategory: async (_, { admin_id, category }, context) => {
      // Checks for expired token.
      if (context.type == "error") {
        return {
          type: "error",
          message: "Token expired.",
        };
      }

      const client = await pool.connect();

      try {
        // Initializes response object.
        let response = {
          content: null,
          type: "",
          message: "",
        };

        // Queries to add a category.
        const query = {
          text: "SELECT * FROM fn_admin_add_category($1, $2, $3) AS result",
          values: [admin_id, category.category_name, category.division],
        };
        const result = await client.query(query);

        // Updates response with query result.
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

        // Returns the response.
        return response;
      } catch (err) {
        // Logs and throws error.
        console.error("Error:", err);
        throw new Error("Failed to add new category.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },

    // Updates an existing category.
    updateCategory: async (_, { admin_id, category_id, category }, context) => {
      // Checks for expired token.
      if (context.type == "error") {
        return {
          type: "error",
          message: "Token expired.",
        };
      }

      const client = await pool.connect();

      try {
        // Initializes response object.
        let response = {
          type: "",
          message: "",
        };

        // Queries to update a category.
        const query = {
          text: "SELECT * FROM fn_admin_update_category($1, $2, $3, $4) AS result",
          values: [
            admin_id,
            category_id,
            category.category_name,
            category.division,
          ],
        };
        const result = await client.query(query);

        // Updates response with query result.
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

        // Returns the response.
        return response;
      } catch (err) {
        // Logs and throws error.
        console.error("Error:", err);
        throw new Error("Failed to update the category.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },

    // Deletes a category.
    deleteCategory: async (_, { admin_id, category_id }, context) => {
      // Checks for expired token.
      if (context.type == "error") {
        return {
          type: "error",
          message: "Token expired.",
        };
      }

      const client = await pool.connect();

      try {
        // Initializes response object.
        let response = {
          type: "",
          message: "",
        };

        // Queries to delete a category.
        const query = {
          text: "SELECT * FROM fn_admin_delete_category($1, $2) AS result",
          values: [admin_id, category_id],
        };
        const result = await client.query(query);

        // Updates response with query result.
        if (result && result.rows.length > 0) {
          const res = result.rows[0].result;
          if (res) {
            response = {
              type: res.type,
              message: res.message,
            };
          }
        }

        // Returns the response.
        return response;
      } catch (err) {
        // Logs and throws error.
        console.error("Error:", err);
        throw new Error("Failed to delete the category.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },
  },
};
