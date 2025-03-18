import { pool } from "../helpers/dbHelper.js";

export const teamResolver = {
    Query: {
        teams: async () => {

            const client = await pool.connect();

            // SQL query to fetch all categories.
            try {
                const query = {
                    text: "SELECT * FROM team",
                };

                // Executing the query and storing the result.
                const result = await client.query(query);

                // Logging the fetched data.
                console.log("Result:", result.rows);
                return result.rows;
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to fetch teams.");
            } finally {
                // Releasing the database connection.
                client.release();
            }
        },

        team: async (_, { id }) => {

            const client = await pool.connect();
            
            try {
                const query = {
                    text: "SELECT * FROM team WHERE team_id = $1",
                    values: [id], // Parameterized query to fetch a category by ID.
                };

                // Executing the query.
                const result = await client.query(query);
                console.log("Result:", result.rows);
                return result.rows[0]; // Returning the fetched category.
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to fetch team.");
            } finally {
                client.release();
            }
        },
    },
    Mutation: {
        addTeam: async (_, { team, admin_id }) => {

            const client = await pool.connect();

            try {

                // Response object to store the result of the operation.
                let response = {
                    content: null,
                    type: "",
                    message: "",
                }; 

                // Parameterized query calling a stored function to add a category.
                const query = {
                    text: "SELECT * FROM fn_admin_add_team($1, $2) AS result", 
                    values: [admin_id, team.team_name], 
                };                

                // Executing the query.
                const result = await client.query(query);

                if (result && result.rows.length > 0) {
                    // Extracting the function result.
                    const res = result.rows[0].result;
                    console.log("Added team result: ", res);

                    // Storing the response details.
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
                throw new Error("Failed to add new team.");
            } finally {
                await client.release();
            }
        },

        updateTeam: async (_, { admin_id, team_id, team }) => {

            const client = await pool.connect();

            try {

                let response = {
                    type: "",
                    message: "",
                };

                const query = {
                    text: "SELECT * FROM fn_admin_update_team($1, $2, $3) AS result",
                    values: [admin_id, team_id, team.team_name],
                };
                
                const result = await client.query(query);
                
                if (result && result.rows.length > 0) {
                    const res = result.rows[0].result;
                    console.log("Updated team result: ", res);
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
                throw new Error("Failed to update the team.");
            } finally {
                await client.end();
            }
        },

        deleteTeam: async (_, { admin_id, team_id }) => {

            const client = await pool.connect();

            try {

                let response = {
                    type: "",
                    message: "",
                  };

                const query = {
                    text: "SELECT * FROM fn_admin_delete_team($1, $2) AS result",
                    values: [admin_id, team_id],
                };

                const result = await client.query(query);
                
                if (result && result.rows.length > 0) {
                    const res = result.rows[0].result;
                    console.log("Deleted team result: ", res);
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
                throw new Error("Failed to delete the team.");
            } finally {
                await client.end();
            }
        },
    },
};
