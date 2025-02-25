import client from "../helpers/dbHelper.js";

export const teamResolver = {
    Query: {
        teams: async () => {
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
            }
        },

        team: async (_, { id }) => {
            try {
                const query = {
                    text: "SELECT * FROM team WHERE team_id = $1",
                    values: [id],
                };
                const result = await client.query(query);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to fetch team.");
            }
        },
    },
    Mutation: {
        addTeam: async (_, { team }) => {
            try {
                const query = {
                    text: "SELECT * FROM fn_admin_add_team($1)",
                    values: [team.team_name],
                };
                const result = await client.query(query);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to add new team.");
            }
        },

        updateTeam: async (_, { id, team }) => {
            try {
                const query = {
                    text: "SELECT * FROM fn_admin_update_team($1, $2)",
                    values: [id, team.team_name],
                };
                const result = await client.query(query);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to update the team.");
            }
        },

        deleteTeam: async (_, { id }) => {
            try {
                const query = {
                    text: "SELECT * FROM fn_admin_delete_team($1)",
                    values: [id],
                };
                const result = await client.query(query);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to delete the team.");
            }
        },
    },
};
