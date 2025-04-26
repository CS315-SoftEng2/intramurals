import { pool } from "../helpers/dbHelper.js";

export const viewDetailsResolver = {
  Query: {
    eventDetails: async () => {
      const client = await pool.connect();

      // SQL query to fetch all event details.
      try {
        const query = {
          text: "SELECT * FROM vw_eventdetails",
        };

        // Executing the query and storing the result.
        const result = await client.query(query);

        return result.rows;
      } catch (err) {
        console.error("Error:", err);
        throw new Error("Failed to fetch event details.");
      } finally {
        // Releasing the database connection.
        client.release();
      }
    },

    teamScores: async () => {
      const client = await pool.connect();

      // SQL query to fetch all teams total scores.
      try {
        const query = {
          text: "SELECT * FROM vw_team_total_scores",
        };

        // Executing the query and storing the result.
        const result = await client.query(query);

        return result.rows;
      } catch (err) {
        console.error("Error:", err);
        throw new Error("Failed to fetch team total scores.");
      } finally {
        // Releasing the database connection.
        client.release();
      }
    },
  },
};
