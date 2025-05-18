import bcrypt from "bcrypt";
import { pool } from "../helpers/dbHelper.js";

// Handles user account-related queries and mutations.
export const userAccountResolver = {
  Query: {
    // Gets all user accounts from the database.
    users: async () => {
      const client = await pool.connect();

      try {
        // Queries all user accounts.
        const query = { text: "SELECT * FROM useraccount" };
        const result = await client.query(query);

        // Returns filtered user list, excluding null rows.
        return result.rows.filter((row) => row !== null);
      } catch (err) {
        // Logs and throws error.
        console.error("Error:", err);
        throw new Error("Failed to fetch users.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },

    // Gets a user account by ID.
    user: async (_, { id }) => {
      const client = await pool.connect();

      try {
        // Queries a user account by ID.
        const query = {
          text: "SELECT * FROM useraccount WHERE user_id = $1",
          values: [id],
        };
        const result = await client.query(query);

        // Returns the user account.
        return result.rows[0];
      } catch (err) {
        // Logs and throws error.
        console.error("Error:", err);
        throw new Error("Failed to fetch user.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },
  },

  Mutation: {
    // Adds a new user account.
    addUserAccount: async (_, { useraccount, admin_id }, context) => {
      if (context.type == "error") {
        return { type: "error", message: "Token expired." };
      }

      const client = await pool.connect();

      try {
        // Initializes response object.
        let response = {
          content: null,
          type: "",
          message: "",
        };

        const { user_name, password, user_type } = useraccount;

        // Hashes the password for security.
        const hashedPassword = await bcrypt.hash(password, 10);

        // Queries to add a user account.
        const query = {
          text: "SELECT * FROM fn_admin_add_user_account($1, $2, $3, $4) AS result",
          values: [admin_id, user_name, hashedPassword, user_type],
        };
        const result = await client.query(query);

        // Updates response with query result.
        if (result && result.rows.length > 0) {
          const res = result.rows[0].result;
          console.log("Added user result: ", res);
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
        throw new Error("Failed to add user account.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },

    // Updates an existing user account.
    updateUserAccount: async (
      _,
      { admin_id, user_id, useraccount },
      context
    ) => {
      if (context.type == "error") {
        return {
          type: "error",
          message: "Token expired.",
        };
      }

      const client = await pool.connect();

      try {
        // Hashes the password if provided.
        let hashedPassword = useraccount.password;
        if (useraccount.password) {
          hashedPassword = await bcrypt.hash(useraccount.password, 10);
        }

        // Initializes response object.
        let response = {
          type: "",
          message: "",
        };

        // Queries to update a user account.
        const query = {
          text: "SELECT fn_admin_update_user_account($1, $2, $3, $4, $5) AS result",
          values: [
            admin_id,
            user_id,
            useraccount.user_name,
            hashedPassword,
            useraccount.user_type,
          ],
        };
        const result = await client.query(query);

        // Updates response with query result.
        if (result && result.rows.length > 0) {
          const res = result.rows[0].result;
          console.log("Updated user result: ", res);
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
        throw new Error("Failed to update user account.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },

    // Deletes a user account.
    deleteUserAccount: async (_, { admin_id, user_id }, context) => {
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

        // Queries to delete a user account.
        const query = {
          text: "SELECT fn_admin_delete_user_account($1, $2) AS result",
          values: [admin_id, user_id],
        };
        const result = await client.query(query);

        // Updates response with query result.
        if (result && result.rows.length > 0) {
          const res = result.rows[0].result;
          console.log("Deleted user result: ", res);
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
        throw new Error("Failed to delete user account.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },
  },
};
