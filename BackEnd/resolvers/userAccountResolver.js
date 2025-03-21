    import bcrypt from "bcrypt";
    import { pool } from "../helpers/dbHelper.js";

    export const userAccountResolver = {

        Query: {
            users: async () => {

                const client = await pool.connect();

                try {
                    const query = {
                        text: "SELECT * FROM useraccount",
                    };

                    const result = await client.query(query);

                    console.log("Result:", result.rows);

                    return result.rows;
                } catch (err) {
                    console.error("Error:", err);
                    throw new Error("Failed to fetch users.");
                } finally {
                    client.release();
                }
            },

            user: async (_, { id }) => {

                const client = await pool.connect();
                
                try {
                    const query = {
                        text: "SELECT * FROM useraccount WHERE user_id = $1",
                        values: [id],
                    };
                    
                    const result = await client.query(query);
                    console.log("Result:", result.rows);
                    return result.rows[0];
                } catch (err) {
                    console.error("Error:", err);
                    throw new Error("Failed to fetch user.");
                } finally {
                    client.release();
                }
            },
        },

        Mutation: {
            addUserAccount: async (_, { useraccount, admin_id }, context) => {

                if (context.type == "error") {
                    return {
                      type: "error",
                      message: "Token expired.",
                    };
                }

                const client = await pool.connect();

                try {

                    let response = {
                        content: null,
                        type: "",
                        message: "",
                    }; 
                
                    const { user_name, password, user_type } = useraccount

                    const hashedPassword = await bcrypt.hash(password, 10);   

                    const query = {
                        text: "SELECT * FROM fn_admin_add_user_account($1, $2, $3, $4) AS result",
                        values: [admin_id, user_name, hashedPassword, user_type],
                    };

                    const result = await client.query(query);
                
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

                    return response;
                } catch (err) {
                    console.error("Error:", err);
                    throw new Error("Failed to add user account.");
                } finally {
                    await client.end();
                }
            },

            updateUserAccount: async (_, { admin_id, user_id, useraccount }, context) => {

                if (context.type == "error") {
                    return {
                      type: "error",
                      message: "Token expired.",
                    };
                }

                const client = await pool.connect();

                try {

                    let hashedPassword = useraccount.password;

                    if (useraccount.password) {
                        hashedPassword = await bcrypt.hash(useraccount.password, 10);
                    }

                    let response = {
                        type: "",
                        message: "",
                    };  

                    const query = {
                        text: "SELECT fn_admin_update_user_account($1, $2, $3, $4, $5) AS result",
                        values: [admin_id, user_id, useraccount.user_name, hashedPassword, useraccount.user_type],
                    };

                    const result = await client.query(query);

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

                    return response;
                } catch (err) {
                    console.error("Error:", err);
                    throw new Error("Failed to update user account.");
                } finally {
                    await client.end();
                }
            },

            deleteUserAccount: async (_, { admin_id, user_id }, context) => {

                if (context.type == "error") {
                    return {
                      type: "error",
                      message: "Token expired.",
                    };
                }

                const client = await pool.connect();

                try {

                    let response = {
                        type: "",
                        message: "",
                    };  

                    const query = {
                        text: "SELECT fn_admin_delete_user_account($1, $2) AS result",
                        values: [admin_id, user_id],
                    };

                    const result = await client.query(query);

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
                    return response;
                } catch (err) {
                    console.error("Error:", err);
                    throw new Error("Failed to delete user account.");
                } finally {
                    await client.end();
                }
            },
        },
    };
