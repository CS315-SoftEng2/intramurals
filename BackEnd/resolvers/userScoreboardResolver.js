import { pool } from "../helpers/dbHelper.js";

export const userUpdateScoreResolver = {
  Mutation: {
    userUpdateScore: async (_, { user_id, match_id, match }, context) => {
      // Checks for expired token.
      if (context.type === "error") {
        return {
          type: "error",
          message: "Token expired.",
        };
      }

      const client = await pool.connect();

      try {
        // Initializes response object.
        let response = {
          content: null,
          type: "",
          message: "",
        };

        // Queries to update match score.
        const query = {
          text: "SELECT fn_user_update_match_score($1, $2, $3, $4) AS result",
          values: [user_id, match_id, match.score_a, match.score_b],
        };
        const result = await client.query(query);

        // Updates response with query result.
        if (result && result.rows.length > 0) {
          const res = result.rows[0].result;
          console.log("Updated match score result: ", res);
          if (res) {
            response = {
              content: res.content,
              type: res.type,
              message: res.message,
            };
          }
        }

        // Returns the response.
        return response;
      } catch (err) {
        // Logs and throws error.
        console.error("Error in userUpdateScore mutation:", err);
        throw new Error("Failed to update scoreboard.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },
  },
};
