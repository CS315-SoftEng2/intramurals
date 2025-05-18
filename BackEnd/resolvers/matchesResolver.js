import { pool } from "../helpers/dbHelper.js";

// Handles match-related queries and mutations.
export const matchesResolver = {
  Query: {
    // Gets all matches from the database.
    getMatches: async () => {
      const client = await pool.connect();
      try {
        // Queries all matches.
        const query = { text: "SELECT * FROM vw_matches" };
        const result = await client.query(query);

        // Returns the match list.
        return result.rows;
      } catch (err) {
        // Logs and throws error.
        console.error("Error:", err);
        throw new Error("Failed to fetch matches.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },

    // Gets a match by ID.
    getMatchById: async (_, { match_id }) => {
      const client = await pool.connect();
      try {
        // Queries a match by ID.
        const query = {
          text: "SELECT * FROM match WHERE match_id = $1",
          values: [match_id],
        };
        const result = await client.query(query);

        // Returns the match.
        return result.rows[0];
      } catch (err) {
        // Logs and throws error.
        console.error("Error:", err);
        throw new Error("Failed to fetch match.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },
  },

  Mutation: {
    // Adds a new match.
    addMatch: async (_, { match, admin_id }, context) => {
      // Checks for expired token.
      if (context.type === "error") {
        return { type: "error", message: "Token expired." };
      }
      const client = await pool.connect();
      try {
        const {
          schedule_id,
          team_a_name,
          team_b_name,
          score_a,
          score_b,
          user_assigned_id,
        } = match;

        // Maps team names to team IDs.
        const teamQuery = {
          text: `SELECT team_id, team_name FROM team WHERE LOWER(team_name) IN ($1, $2)`,
          values: [team_a_name.toLowerCase(), team_b_name.toLowerCase()],
        };
        const teamResult = await client.query(teamQuery);

        const teamMap = {};
        teamResult.rows.forEach((t) => {
          teamMap[t.team_name.toLowerCase()] = t.team_id;
        });

        const teamAId = teamMap[team_a_name.toLowerCase()];
        const teamBId = teamMap[team_b_name.toLowerCase()];

        // Returns error if team IDs are not found.
        if (!teamAId || !teamBId) {
          return {
            type: "error",
            message: `Team not found: ${team_a_name}, ${team_b_name}`,
          };
        }

        // Queries to add a match.
        const matchQuery = {
          text: `SELECT * FROM fn_admin_add_match($1, $2, $3, $4, $5, $6, $7)`,
          values: [
            admin_id,
            schedule_id,
            teamAId,
            teamBId,
            score_a,
            score_b,
            user_assigned_id,
          ],
        };
        const result = await client.query(matchQuery);

        // Returns error if no result.
        if (!result.rows[0]) {
          return {
            type: "error",
            message: "Failed to add match: No result from database.",
          };
        }

        // Returns success response.
        return {
          content: result.rows[0],
          type: "success",
          message: "Match added successfully.",
        };
      } catch (err) {
        // Logs and returns error.
        console.error("Error adding match:", err);
        return {
          type: "error",
          message: `Failed to add match: ${err.message}`,
        };
      } finally {
        // Closes the database connection.
        client.release();
      }
    },

    // Updates an existing match.
    updateMatch: async (_, { admin_id, match_id, match }, context) => {
      // Checks for expired token.
      if (context.type === "error") {
        return { type: "error", message: "Token expired." };
      }
      const client = await pool.connect();
      try {
        const {
          schedule_id,
          team_a_name,
          team_b_name,
          score_a,
          score_b,
          user_assigned_id,
        } = match;

        // Maps team names to team IDs.
        const teamQuery = {
          text: `SELECT team_id, team_name FROM team WHERE LOWER(team_name) IN ($1, $2)`,
          values: [team_a_name.toLowerCase(), team_b_name.toLowerCase()],
        };
        const teamResult = await client.query(teamQuery);

        const teamMap = {};
        teamResult.rows.forEach((t) => {
          teamMap[t.team_name.toLowerCase()] = t.team_id;
        });

        const teamAId = teamMap[team_a_name.toLowerCase()];
        const teamBId = teamMap[team_b_name.toLowerCase()];

        // Returns error if team IDs are not found.
        if (!teamAId || !teamBId) {
          return {
            type: "error",
            message: `Team not found: ${team_a_name}, ${team_b_name}`,
          };
        }

        // Queries to update a match.
        const matchQuery = {
          text: `SELECT * FROM fn_admin_update_match($1, $2, $3, $4, $5, $6, $7, $8)`,
          values: [
            admin_id,
            match_id,
            schedule_id,
            teamAId,
            teamBId,
            score_a,
            score_b,
            user_assigned_id,
          ],
        };
        const result = await client.query(matchQuery);

        // Returns error if no result.
        if (!result.rows[0]) {
          return {
            type: "error",
            message: "Failed to update match: No result from database.",
          };
        }

        // Returns success response.
        return {
          type: "success",
          message: "Match updated successfully.",
        };
      } catch (err) {
        // Logs and returns error.
        console.error("Error updating match:", err);
        return {
          type: "error",
          message: `Failed to update match: ${err.message}`,
        };
      } finally {
        // Closes the database connection.
        client.release();
      }
    },

    // Deletes a match.
    deleteMatch: async (_, { admin_id, match_id }, context) => {
      // Checks for expired token.
      if (context.type === "error") {
        return { type: "error", message: "Token expired." };
      }
      const client = await pool.connect();
      try {
        // Queries to delete a match.
        const query = {
          text: "SELECT * FROM fn_admin_delete_match($1, $2) AS result",
          values: [admin_id, match_id],
        };
        const result = await client.query(query);

        // Returns the query result.
        return {
          type: result.rows[0].result.type,
          message: result.rows[0].result.message,
        };
      } catch (err) {
        // Logs and throws error.
        console.error("Error:", err);
        throw new Error("Failed to delete match.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },
  },
};
