import { pool } from "../helpers/dbHelper.js";

export const matchesResolver = {
  Query: {
    getMatches: async () => {
      const client = await pool.connect();
      try {
        const query = {
          text: `
            SELECT 
              m.match_id,
              m.schedule_id,
              m.team_a_id,
              m.team_b_id,
              m.score_a,
              m.score_b,
              ta.team_logo AS team_a_logo,
              tb.team_logo AS team_b_logo,
              ta.team_color AS team_a_color,
              tb.team_color AS team_b_color,
              m.user_assigned_id,
              CASE 
                WHEN m.score_a > m.score_b THEN ta.team_color
                WHEN m.score_b > m.score_a THEN tb.team_color
                ELSE NULL
              END AS winner_team_color,
              CASE 
                WHEN m.score_a > m.score_b THEN m.team_a_id
                WHEN m.score_b > m.score_a THEN m.team_b_id
                ELSE NULL
              END AS winner_team_id,
              e.event_name,
              c.division,
              ta.team_name AS team_a_name,
              tb.team_name AS team_b_name
            FROM match m
            LEFT JOIN team ta ON m.team_a_id = ta.team_id
            LEFT JOIN team tb ON m.team_b_id = tb.team_id
            LEFT JOIN schedule s ON m.schedule_id = s.schedule_id
            LEFT JOIN events e ON s.event_id = e.event_id
            LEFT JOIN category c ON e.category_id = c.category_id;
          `,
        };

        const result = await client.query(query);
        return result.rows;
      } catch (err) {
        console.error("Error:", err);
        throw new Error("Failed to fetch matches.");
      } finally {
        client.release();
      }
    },

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

        // Map team names to team_ids
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
            message: `One or both team names not found: ${team_a_name}, ${team_b_name}`,
          };
        }

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
        if (!result.rows[0]) {
          return {
            type: "error",
            message: "Failed to add match: No result returned from database.",
          };
        }

        return {
          content: result.rows[0],
          type: "success",
          message: "Match added successfully.",
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

        // Map team names to team_ids
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
            message: `One or both team names not found: ${team_a_name}, ${team_b_name}`,
          };
        }

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
        if (!result.rows[0]) {
          return {
            type: "error",
            message:
              "Failed to update match: No result returned from database.",
          };
        }

        return {
          type: "success",
          message: "Match updated successfully.",
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
        return {
          type: result.rows[0].result.type,
          message: result.rows[0].result.message,
        };
      } catch (err) {
        console.error("Error:", err);
        throw new Error("Failed to delete match.");
      } finally {
        client.release();
      }
    },
  },
};
