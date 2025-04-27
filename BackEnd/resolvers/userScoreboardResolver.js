import { pool } from "../helpers/dbHelper.js";

export const userUpdateScoreResolver = {
  Mutation: {
    userUpdateScore: async (_, { user_id, match_id, match }, context) => {
      if (context.type === "error") {
        return {
          type: "error",
          message: "Token expired.",
        };
      }

      const client = await pool.connect();

      try {
        const query = {
          text: "SELECT fn_user_update_match_score($1, $2, $3, $4) AS result",
          values: [user_id, match_id, match.score_a, match.score_b],
        };

        const { rows } = await client.query(query);
        const result = rows[0].result;

        console.log("fn_user_update_match_score result:", result);

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
            match_id: result.match.match_id,
            score_a: result.match.score_a,
            score_b: result.match.score_b,
            score_updated_at: result.match.score_updated_at,
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
