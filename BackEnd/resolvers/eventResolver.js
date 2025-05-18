import { pool } from "../helpers/dbHelper.js";

// Handles event-related queries and mutations.
export const eventResolver = {
  Query: {
    // Gets all events from the database.
    events: async () => {
      const client = await pool.connect();

      try {
        // Queries all events.
        const query = { text: "SELECT * FROM events" };
        const result = await client.query(query);

        // Returns the event list.
        return result.rows;
      } catch (err) {
        // Logs and throws error.
        console.error("Error:", err);
        throw new Error("Failed to fetch the events.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },

    // Gets an event by ID.
    event: async (_, { id }) => {
      const client = await pool.connect();

      try {
        // Queries an event by ID.
        const query = {
          text: "SELECT * FROM events WHERE event_id = $1",
          values: [id],
        };
        const result = await client.query(query);

        // Returns the event.
        return result.rows[0];
      } catch (err) {
        // Logs and throws error.
        console.error("Error:", err);
        throw new Error("Failed to fetch the event.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },
  },
  Mutation: {
    // Adds a new event.
    addEvent: async (_, { admin_id, event }, context) => {
      // Checks for expired token.
      if (context.type == "error") {
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

        // Queries to add an event.
        const query = {
          text: "SELECT * FROM fn_admin_add_event($1, $2, $3, $4) AS result",
          values: [admin_id, event.event_name, event.venue, event.category_id],
        };
        const result = await client.query(query);

        // Updates response with query result.
        if (result && result.rows.length > 0) {
          const res = result.rows[0].result;
          console.log("Add event result: ", res);
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
        throw new Error("Failed to add new event.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },

    // Updates an existing event.
    updateEvent: async (_, { admin_id, event_id, event }, context) => {
      // Checks for expired token.
      if (context.type == "error") {
        return {
          type: "error",
          message: "Token expired.",
        };
      }

      const client = await pool.connect();

      try {
        // Initializes response object.
        let response = {
          type: "",
          message: "",
        };

        // Queries to update an event.
        const query = {
          text: "SELECT * FROM fn_admin_update_event($1, $2, $3, $4, $5) AS result",
          values: [
            admin_id,
            event_id,
            event.event_name,
            event.venue,
            event.category_id,
          ],
        };
        const result = await client.query(query);

        // Updates response with query result.
        if (result && result.rows.length > 0) {
          const res = result.rows[0].result;
          console.log("Updated event result: ", res);
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
        throw new Error("Failed to update the event.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },

    // Deletes an event.
    deleteEvent: async (_, { admin_id, event_id }, context) => {
      // Checks for expired token.
      if (context.type == "error") {
        return {
          type: "error",
          message: "Token expired.",
        };
      }

      const client = await pool.connect();

      try {
        // Initializes response object.
        let response = {
          type: "",
          message: "",
        };

        // Queries to delete an event.
        const query = {
          text: "SELECT * FROM fn_admin_delete_event($1, $2) AS result",
          values: [admin_id, event_id],
        };
        const result = await client.query(query);

        // Updates response with query result.
        if (result && result.rows.length > 0) {
          const res = result.rows[0].result;
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
        throw new Error("Failed to delete the event.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },
  },
};
