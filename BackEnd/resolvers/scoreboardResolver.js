import { pool } from '../helpers/dbHelper.js';

export const scoreboardResolver = {
    Query: {
        scoreboards: async () => {
            const client = await pool.connect();

            // SQL query to fetch all categories.
            try {
                const query = {
                    text: "SELECT * FROM scoreboard",
                };

                // Executing the query and storing the result.
                const result = await client.query(query);

                // Logging the fetched data.
                console.log("Result:", result.rows);
                return result.rows;
            } catch (err) {
                console.error("Error fetching scoreboards:", err);
                throw new Error("Failed to fetch scoreboards.");
            } finally {
                client.release();
            }
        },
        scoreboard: async (_, { id }) => {
            const client = await pool.connect();
            try {
                const query = {
                    text: "SELECT * FROM scoreboard WHERE scoreboard_id = $1",
                    values: [id], // Parameterized query to fetch a category by ID.
                };

                // Executing the query.
                const result = await client.query(query);
                console.log("Result:", result.rows);
                return result.rows[0] || null; // Returning the fetched category.
            } catch (err) {
                console.error("Error fetching scoreboard:", err);
                throw new Error("Failed to fetch scoreboard.");
            } finally {
                client.release();
            }
        },
    },
    
    Mutation: {
        addScoreboard: async (_, { admin_id, scoreboard }) => {
            console.log("addScoreboard called with:", { admin_id, scoreboard });
        
            const client = await pool.connect();

            try {
                const query = {
                    text: "SELECT fn_admin_add_scoreboard($1, $2, $3, $4, $5) AS result",
                    values: [
                        admin_id,
                        scoreboard.user_id,
                        scoreboard.team_id,
                        scoreboard.event_id,
                        scoreboard.schedule_id,
                    ],
                };
        
                console.log("Executing query:", query);
        
                const result = await client.query(query);
                console.log("Raw DB response:", result.rows);
        
                if (result.rows.length > 0 && result.rows[0].result) {
                    let res = result.rows[0].result;
        
                    if (typeof res === "string") {
                        try {
                            res = JSON.parse(res);
                        } catch (error) {
                            console.error("Error parsing JSON from DB:", error);
                            throw new Error("Invalid JSON response from database");
                        }
                    }
        
                    console.log("Parsed response:", res);
                    return res; 
                }
        
                console.error("Unexpected empty response from database.");
                return { type: "error", message: "Unexpected empty response", content: null };
            } catch (err) {
                console.error("Error adding scoreboard:", err);
                throw new Error("Failed to add scoreboard.");
            } finally {
                client.release();
            }
        },        

        updateScoreboard: async (_, { user_id, scoreboard_id, score }) => {
            console.log("updateScoreboard called with:", { user_id, scoreboard_id, score });

            const client = await pool.connect();
            try {
                const query = {
                    text: "SELECT fn_user_update_scoreboard($1, $2, $3) AS result",
                    values: [user_id, scoreboard_id, score],
                };

                console.log("Executing query:", query);

                const result = await client.query(query);
                console.log("Raw DB response:", result.rows);

                if (result?.rows?.length > 0 && result.rows[0].result) {
                    let res = result.rows[0].result;

                    if (typeof res === "string") {
                        try {
                            res = JSON.parse(res);
                        } catch (error) {
                            console.error("Error parsing JSON from DB:", error);
                            throw new Error("Invalid JSON response from database");
                        }
                    }

                    console.log("Parsed response:", res);
                    return res;
                }

                return { type: "error", message: "Unexpected empty response", content: null };
            } catch (err) {
                console.error("Error in updateScoreboard:", err);
                throw new Error("Failed to update scoreboard.");
            } finally {
                client.release();
            }
        },

        deleteScoreboard: async (_, { admin_id, scoreboard_id }) => {
            const client = await pool.connect();
            try {
                const query = {
                    text: "SELECT fn_admin_delete_scoreboard($1, $2) AS result",
                    values: [admin_id, scoreboard_id],
                };

                const result = await client.query(query);
                console.log("Raw DB response:", result.rows);

                if (result?.rows?.length > 0 && result.rows[0].result) {
                    let res = result.rows[0].result;

                    if (typeof res === "string") {
                        try {
                            res = JSON.parse(res);
                        } catch (error) {
                            console.error("Error parsing JSON from DB:", error);
                            throw new Error("Invalid JSON response from database");
                        }
                    }

                    console.log("Parsed response:", res);
                    return res;
                }

                return { type: "error", message: "Unexpected empty response", content: null };
            } catch (err) {
                console.error("Error deleting scoreboard:", err);
                throw new Error("Failed to delete scoreboard.");
            } finally {
                client.release();
            }
        },
    },
};
