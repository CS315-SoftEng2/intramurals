import client from '../helpers/dbHelper.js';

export const eventResolver ={
    Query: {
        events: async () => {
            try {
                const query = {
                    text: "SELECT * FROM events",
                };
                const result = await client.query(query);
                console.log("Result:", result.rows);
                return result.rows;
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to fetch the events.");
            }
        },
        event: async (_, { id }) => {
            try {
                const query = {
                    text: "SELECT * FROM events WHERE event_id = $1",
                    values: [id],
                };
                const result = await client.query(query);
                return result.rows[0];
            } catch (err) {
                console.error("Error", err);
                throw new Error("Failed to fetch the event.");
            }
        },
    },
    Mutation: {
        addEvent: async (_, { event }) => {
            try {
                const query = {
                    text: "SELECT * FROM fn_admin_add_event($1, $2, $3, $4)",
                    values: [event.event_name, event.venue, event.team_id, event.category_id],
                };
                const result = await client.query(query);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to add new event.");
            }
        },
        updateEvent: async (_, { id, event }) => {
            try {
                const query = {
                    text: "SELECT * FROM fn_admin_update_event($1, $2, $3, $4, $5)",
                    values: [id, event.event_name, event.venue, event.team_id, event.category_id],
                };
                const result = await client.query(query);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to update the event.");
            }
        },
        deleteEvent: async (_, { id }) => {
            try {
                const query = {
                    text: "SELECT * FROM fn_admin_delete_event($1)",
                    values: [id],
                };
                const result = await client.query(query);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to delete the event.");
            }
        },
    },
};