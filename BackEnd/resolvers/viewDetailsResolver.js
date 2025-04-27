import { pool } from "../helpers/dbHelper.js";
import { formatDate, formatTime } from "../helpers/scalarHandler.js";

export const viewDetailsResolver = {
  Query: {
    scoreboard: async () => {
      const client = await pool.connect();

      // SQL query to fetch all scoreboard details.
      try {
        const query = {
          text: "SELECT * FROM vw_scoreboard",
        };

        // Executing the query and storing the result.
        const result = await client.query(query);

        return result.rows.map((row) => ({
          ...row,
          date: formatDate(row.date),
          start_time: formatTime(row.start_time),
          end_time: formatTime(row.end_time),
        }));
      } catch (err) {
        console.error("Error:", err);
        throw new Error("Failed to fetch scoreboard details.");
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
