import { pool } from "../helpers/dbHelper.js";

// Handles match-related queries and mutations.
export const matchesResolver = {
  Query: {
    // Gets all matches from the database.
    getMatches: async () => {
      const client = await pool.connect();
      try {
        const query = { text: "SELECT * FROM vw_matches" };
        const result = await client.query(query);
        return result.rows;
      } catch (err) {
        console.error("Error:", err);
        throw new Error("Failed to fetch matches.");
      } finally {
        client.release();
      }
    },

    // Gets a match by ID.
    getMatchById: async (_, { match_id }) => {
      const client = await pool.connect();
      try {
        const query = {
          text: "SELECT * FROM match WHERE match_id = $1",
          values: [match_id],
        };
        const result = await client.query(query);
        return result.rows[0];
      } catch (err) {
        console.error("Error:", err);
        throw new Error("Failed to fetch match.");
      } finally {
        client.release();
      }
    },
  },

  Mutation: {
    // Adds a new match.
    addMatch: async (_, { match, admin_id }, context) => {
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

        // Step 1: Get team IDs from team names
        const teamQuery = {
          text: `SELECT team_id, LOWER(team_name) AS team_name FROM team WHERE LOWER(team_name) IN ($1, $2)`,
          values: [team_a_name.toLowerCase(), team_b_name.toLowerCase()],
        };
        const teamResult = await client.query(teamQuery);

        const teamMap = {};
        teamResult.rows.forEach((row) => {
          teamMap[row.team_name] = row.team_id;
        });

        const teamAId = teamMap[team_a_name.toLowerCase()];
        const teamBId = teamMap[team_b_name.toLowerCase()];

        if (!teamAId || !teamBId) {
          return {
            type: "error",
            message: `Team not found: ${!teamAId ? team_a_name : ""} ${
              !teamBId ? team_b_name : ""
            }`.trim(),
          };
        }

        // Step 2: Call the PostgreSQL function to add the match
        const matchQuery = {
          text: `SELECT * FROM fn_admin_add_match($1, $2, $3, $4, $5, $6, $7) AS result`,
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
        const res = result.rows?.[0]?.result;

        if (!res || !res.content) {
          return {
            type: "error",
            message:
              res?.message || "Failed to add match: No content returned.",
          };
        }

        return {
          content: res.content,
          type: res.type,
          message: res.message,
        };
      } catch (err) {
        console.error("Error adding match:", err);
        return {
          type: "error",
          message: `Failed to add match: ${err.message}`,
        };
      } finally {
        client.release();
      }
    },

    // Updates an existing match.
    updateMatch: async (_, { admin_id, match_id, match }, context) => {
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

        if (!teamAId || !teamBId) {
          return {
            type: "error",
            message: `Team not found: ${team_a_name}, ${team_b_name}`,
          };
        }

        const matchQuery = {
          text: `SELECT * FROM fn_admin_update_match($1, $2, $3, $4, $5, $6, $7, $8) AS result`,
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

        if (result.rows.length > 0 && result.rows[0].result) {
          return result.rows[0].result;
        }

        return {
          type: "error",
          message: "Failed to update match: No result from database.",
        };
      } catch (err) {
        console.error("Error updating match:", err);
        return {
          type: "error",
          message: `Failed to update match: ${err.message}`,
        };
      } finally {
        client.release();
      }
    },

    // Deletes a match.
    deleteMatch: async (_, { admin_id, match_id }, context) => {
      if (context.type === "error") {
        return { type: "error", message: "Token expired." };
      }

      const client = await pool.connect();
      try {
        const query = {
          text: "SELECT * FROM fn_admin_delete_match($1, $2) AS result",
          values: [admin_id, match_id],
        };
        const result = await client.query(query);

        if (result.rows.length > 0 && result.rows[0].result) {
          return result.rows[0].result;
        }

        return {
          type: "error",
          message: "Failed to delete match: No result from database.",
        };
      } catch (err) {
        console.error("Error deleting match:", err);
        return {
          type: "error",
          message: "Failed to delete match.",
        };
      } finally {
        client.release();
      }
    },
  },
};
