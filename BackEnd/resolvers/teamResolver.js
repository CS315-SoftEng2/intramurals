import { pool } from "../helpers/dbHelper.js";

export const teamResolver = {
    Query: {
        teams: async () => {

            const client = await pool.connect();

            try {
                const query = {
                    text: "SELECT * FROM team",
                };

                const result = await client.query(query);
                console.log("Result:", result.rows);
                return result.rows;
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to fetch teams.");
            } finally {
                client.release();
            }
        },

        team: async (_, { id }) => {

            const client = await pool.connect();
            
            try {
                const query = {
                    text: "SELECT * FROM team WHERE team_id = $1",
                    values: [id],
                };

                const result = await client.query(query);
                console.log("Result:", result.rows);
                return result.rows[0];
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

                let response = {
                    content: null,
                    type: "",
                    message: "",
                }; 

                const query = {
                    text: "SELECT * FROM fn_admin_add_team($1, $2) AS result", 
                    values: [admin_id, team.team_name], 
                };                

                const result = await client.query(query);

                if (result && result.rows.length > 0) {
                    const res = result.rows[0].result;
                    console.log("Added team result: ", res);
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
