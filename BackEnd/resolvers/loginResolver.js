import bcrypt from "bcrypt";
import { pool } from "../helpers/dbHelper.js";
import generateToken from "../helpers/tokenHelper.js";

// Handles user login requests.
export const loginResolver = {
  Mutation: {
    // Logs in a user with username and password.
    userLogin: async (_, { user_name, password }) => {
      const client = await pool.connect();

      try {
        // Queries the database for user data.
        const query = {
          text: "SELECT * FROM fn_login($1)",
          values: [user_name],
        };
        const result = await client.query(query);

        // Returns error if no user is found.
        if (result.rows.length === 0) {
          return { type: "error", message: "Invalid credentials", token: "" };
        }

        const userData = result.rows[0].fn_login;

        // Returns error if the database function fails.
        if (userData.type === "error") {
          return { type: "error", message: userData.message, token: "" };
        }

        // Creates user object from query result.
        const user = {
          user_id: userData.user_id,
          user_name: userData.user_name,
          password: userData.password,
          user_type: userData.user_type,
        };

        // Checks if the password is correct.
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return { type: "error", message: "Invalid credentials", token: "" };
        }

        // Generates and returns a token with user details.
        const token = await generateToken(user);
        return {
          type: "success",
          message: "Login successful",
          token: token,
          user: {
            user_id: user.user_id,
            user_name: user.user_name,
            user_type: user.user_type,
          },
        };
      } catch (err) {
        // Logs and returns error message.
        console.error("Login error:", err.message);
        return {
          type: "error",
          message: "Login failed: " + err.message,
          token: "",
        };
      } finally {
        // Closes the database connection.
        client.release();
      }
    },
  },
};
