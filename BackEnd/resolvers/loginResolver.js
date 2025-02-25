import bcrypt from "bcrypt";
import client from "../helpers/dbHelper.js";

export const loginResolver = {
    Mutation: {
        userLogin: async (_, { user_name, password }) => {
            try {

                const result = await client.query("SELECT * FROM useraccount WHERE user_name = $1",[ user_name ]);
                const user = result.rows[0];

                const checkPassword = await bcrypt.compare(password, user.password);

                let message = "Login successfully!";
                if(!checkPassword) {
                    message = "Login failed!";
                } 

                return {
                    message: message,
                    user
                }
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to login user account.");
            }
        }
    },
};
