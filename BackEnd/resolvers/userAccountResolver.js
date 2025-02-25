import bcrypt from "bcrypt";
import client from "../helpers/dbHelper.js";

export const userAccountResolver = {
    Query: {
        users: async () => {
            try {
                const query = {
                    text: "SELECT * FROM useraccount",
                };
                const result = await client.query(query);
                return result.rows;
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to fetch users.");
            }
        },

        user: async (_, { id }) => {
            try {
                const query = {
                    text: "SELECT * FROM useraccount WHERE user_id = $1",
                    values: [id],
                };
                const result = await client.query(query);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to fetch user.");
            }
        },
    },

    Mutation: {
        addUserAccount: async (_, { useraccount, admin_id }) => {
            try {
                const hashedPassword = await bcrypt.hash(useraccount.password, 10);

                const query = {
                    text: "SELECT fn_admin_add_user_account($1, $2, $3, $4) AS result",
                    values: [admin_id, useraccount.user_name, hashedPassword, useraccount.user_type],
                };

                const result = await client.query(query);
                return { message: result.rows[0].result };
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to add user account.");
            }
        },

        updateUserAccount: async (_, { admin_id, useraccount }) => {
            try {
                let hashedPassword = useraccount.password;
                if (useraccount.password) {
                    hashedPassword = await bcrypt.hash(useraccount.password, 10);
                }

                const query = {
                    text: "SELECT fn_admin_update_user_account($1, $2, $3, $4, $5) AS result",
                    values: [admin_id, useraccount.user_id, useraccount.user_name, hashedPassword, useraccount.user_type],
                };

                const result = await client.query(query);
                return { message: result.rows[0].result };
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to update user account.");
            }
        },

        deleteUserAccount: async (_, { admin_id, user_id }) => {
            try {
                const query = {
                    text: "SELECT fn_admin_delete_user_account($1, $2) AS result",
                    values: [admin_id, user_id],
                };

                const result = await client.query(query);
                return { message: result.rows[0].result };
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to delete user account.");
            }
        },
    },
};
