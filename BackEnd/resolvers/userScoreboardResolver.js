import { pool } from "../helpers/dbHelper.js";

export const userUpdateScoreResolver = {
  Mutation: {
    userUpdateScore: async (_, { user_id, match_id, match }, context) => {
      // Check for token errors
      if (context.type === "error") {
        return {
          type: "error",
          message: "Token expired.",
        };
      }

      const client = await pool.connect();

      try {
        // Define SQL query and values
        const query = {
          text: "SELECT fn_user_update_match_score($1, $2, $3, $4) AS result",
          values: [user_id, match_id, match.score_a, match.score_b],
        };

        // Execute the function
        const { rows } = await client.query(query);
        const result = rows[0].result;

        // Log the function result for debugging
        console.log("fn_user_update_match_score result:", result);

        // Check the function response
        if (result.type === "error") {
          return {
            type: "error",
            message: result.message,
          };
        }

        return {
          type: "success",
          message: result.message,
          match: {
            match_id,
            score_a: match.score_a,
            score_b: match.score_b,
          },
        };
      } catch (err) {
        console.error("Error in userUpdateScore mutation:", err);
        return {
          type: "error",
          message: err.message || "Failed to update scoreboard.",
        };
      } finally {
        client.release();
      }
    },
  },
};
