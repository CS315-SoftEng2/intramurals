import client from '../helpers/dbHelper.js';

export const scoreboardResolver = {
    Query: {
        scoreboards: async () => {
            try {
                const query = {
                    text: "SELRCT * FROM scoreboard",
                };
                const result = await client.query(query);
                return result.rows;
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to fetch scoreboard.");
            }
        },
        scoreboard: async (_, { id }) => {
            try {
                const query = {
                    text: "SELECT * FROM scoreboard WHERE scoreboard_id = $1",
                    values: [id],
                };
                const result = await client.query(query);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to fetch the scoreboard.");
            }
        },
    },
    Mutation: {
        addScoreboard: async (_, { scoreboard }) => {
            try {
                const query = {
                    text: "SELECT * FROM fn_admin_add_scoreboard($1, $2, $3, $4, $5, $6)",
                    values: [scoreboard.score, scoreboard.ranking, scoreboard.team_id, scoreboard.user_id, scoreboard.event_id, scoreboard.schedule_id],
                };
                const result = await client.query(query);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to add new scoreboard.");
            }
        },
        updateScoreboard: async (_, { id, scoreboard }) => {
            try {
                const query = {
                    text: "SELECT * FROM scoreboard($1, $2, $3, $4, $5, $6, $7)",
                    values: [id, scoreboard.score, scoreboard.ranking, scoreboard.team_id, scoreboard.user_id, scoreboard.event_id, scoreboard.schedule_id],
                };
                const result = await client.query(query);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to update the scoreboard.");
            }
        },
        deleteScoreboard: async (_, { id }) => {
            try {
                const query = {
                    text: "SELECT * FROM fn_admin_delete_scoreboard($1)",
                    values: [id],
                };
                const result = await client.query(query);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to delete the scoreboard.");
            }
        },
    },
};