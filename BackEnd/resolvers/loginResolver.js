import bcrypt from 'bcrypt';
import { pool } from "../helpers/dbHelper.js";
import generateToken from "../helpers/tokenHelper.js";

export const loginResolver = {
    Mutation: {
        userLogin: async (_, { user_name, password }) => {
            const client = await pool.connect();

            let response = {
                type: "",
                message: "Invalid credential",
                token: "",
            };

            try {
                console.log("Attempting login for:", user_name);

                const query = {
                    text: "SELECT * FROM fn_login($1)", 
                    values: [user_name],  
                };

                const result = await client.query(query);
                
                if (result.rows.length === 0) {
                    console.log("User not found in DB.");
                    return { type: "error", message: "Invalid credentials", token: "" };
                }

                const user = result.rows[0].fn_login;

                // Compare input password with stored hashed password
                const isValid = await bcrypt.compare(password, user.password);
                console.log("Password verification result:", isValid);

                if(isValid) {
                    const token = await generateToken(user);
                    response = {
                        type: "success",
                        message: "Login successfully!",
                        token: token
                    }
                }

                return response;
            } catch (err) {
                console.error("Login Error:", err.message);
                throw new Error(err.message);
            } finally {
                client.release();
            }
        }
    }
};
