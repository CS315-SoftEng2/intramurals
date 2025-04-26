import bcrypt from "bcrypt";
import { pool } from "../helpers/dbHelper.js";
import generateToken from "../helpers/tokenHelper.js";

export const loginResolver = {
  Mutation: {
    userLogin: async (_, { user_name, password }) => {
      const client = await pool.connect();

      try {
        const query = {
          text: "SELECT * FROM fn_login($1)",
          values: [user_name],
        };

        const result = await client.query(query);

        if (result.rows.length === 0) {
          return { type: "error", message: "Invalid credentials", token: "" };
        }

        const userData = result.rows[0].fn_login;

        if (userData.type === "error") {
          return { type: "error", message: userData.message, token: "" };
        }

        const user = {
          user_id: userData.user_id,
          user_name: userData.user_name,
          password: userData.password,
          user_type: userData.user_type,
        };

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return { type: "error", message: "Invalid credentials", token: "" };
        }

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
        console.error("Login error:", err.message);
        return {
          type: "error",
          message: "Login failed: " + err.message,
          token: "",
        };
      } finally {
        client.release();
      }
    },
  },
};
