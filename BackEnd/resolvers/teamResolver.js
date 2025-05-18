import { pool } from "../helpers/dbHelper.js";

// Handles team-related queries and mutations.
export const teamResolver = {
  Query: {
    // Gets all teams from the database.
    teams: async () => {
      const client = await pool.connect();

      try {
        // Queries all teams.
        const query = { text: "SELECT * FROM team" };
        const result = await client.query(query);

        // Returns the team list.
        return result.rows;
      } catch (err) {
        // Logs and throws error.
        console.error("Error:", err);
        throw new Error("Failed to fetch teams.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },

    // Gets a team by ID.
    team: async (_, { id }) => {
      const client = await pool.connect();

      try {
        // Queries a team by ID.
        const query = {
          text: "SELECT * FROM team WHERE team_id = $1",
          values: [id],
        };
        const result = await client.query(query);

        // Returns the team.
        return result.rows[0];
      } catch (err) {
        // Logs and throws error.
        console.error("Error:", err);
        throw new Error("Failed to fetch team.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },
  },
  Mutation: {
    // Adds a new team.
    addTeam: async (_, { team, admin_id }, context) => {
      // Checks for expired token.
      if (context.type == "error") {
        return { type: "error", message: "Token expired." };
      }

      const client = await pool.connect();

      try {
        // Initializes response object.
        let response = {
          content: null,
          type: "",
          message: "",
        };

        // Queries to add a team.
        const query = {
          text: "SELECT * FROM fn_admin_add_team($1, $2, $3, $4, $5) AS result",
          values: [
            admin_id,
            team.team_name,
            team.team_color,
            team.team_logo,
            team.team_motto,
          ],
        };
        const result = await client.query(query);

        // Updates response with query result.
        if (result && result.rows.length > 0) {
          const res = result.rows[0].result;
          console.log("Added team result: ", res);
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
        console.error("Error:", err);
        throw new Error("Failed to add new team.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },

    // Updates an existing team.
    updateTeam: async (_, { admin_id, team_id, team }, context) => {
      // Checks for expired token.
      if (context.type == "error") {
        return { type: "error", message: "Token expired." };
      }

      const client = await pool.connect();

      try {
        // Initializes response object.
        let response = {
          type: "",
          message: "",
        };

        // Queries to update a team.
        const query = {
          text: "SELECT * FROM fn_admin_update_team($1, $2, $3, $4, $5, $6) AS result",
          values: [
            admin_id,
            team_id,
            team.team_name,
            team.team_color,
            team.team_logo,
            team.team_motto,
          ],
        };
        const result = await client.query(query);

        // Updates response with query result.
        if (result && result.rows.length > 0) {
          const res = result.rows[0].result;
          console.log("Updated team result: ", res);
          if (res) {
            response = {
              type: res.type,
              message: res.message,
            };
          }
        }

        // Returns the response.
        return response;
      } catch (err) {
        // Logs and throws error.
        console.error("Error:", err);
        throw new Error("Failed to update the team.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },

    // Deletes a team.
    deleteTeam: async (_, { admin_id, team_id }, context) => {
      // Checks for expired token.
      if (context.type == "error") {
        return { type: "error", message: "Token expired." };
      }

      const client = await pool.connect();

      try {
        // Initializes response object.
        let response = {
          type: "",
          message: "",
        };

        // Queries to delete a team.
        const query = {
          text: "SELECT * FROM fn_admin_delete_team($1, $2) AS result",
          values: [admin_id, team_id],
        };
        const result = await client.query(query);

        // Updates response with query result.
        if (result && result.rows.length > 0) {
          const res = result.rows[0].result;
          console.log("Deleted team result: ", res);
          if (res) {
            response = {
              type: res.type,
              message: res.message,
            };
          }
        }

        // Returns the response.
        return response;
      } catch (err) {
        // Logs and throws error.
        console.error("Error:", err);
        throw new Error("Failed to delete the team.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },
  },
};
