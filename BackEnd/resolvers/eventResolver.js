import { pool } from '../helpers/dbHelper.js';

export const eventResolver = {
    Query: {
        events: async () => {
            const client = await pool.connect();

            try {
                const query = { text: "SELECT * FROM events" }; 

                const result = await client.query(query);
                console.log("Result:", result.rows);
                return result.rows;
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to fetch the events.");
            } finally {
                client.release(); 
            }
        },
        event: async (_, { id }) => {
            const client = await pool.connect(); 

            try {
                const query = {
                    text: "SELECT * FROM events WHERE event_id = $1", 
                    values: [id],
                };
                const result = await client.query(query);
                console.log("Result:", result.rows);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to fetch the event.");
            } finally {
                client.release(); 
            }
        },
    },
    Mutation: {
        addEvent: async (_, { admin_id, event }, context) => { 

            if (context.type == "error") {
                return {
                  type: "error",
                  message: "Token expired.",
                };
            }

            const client = await pool.connect();

            try {
                let response = {
                    content: null,
                    type: "",
                    message: "",
                };

                const query = {
                    text: "SELECT * FROM fn_admin_add_event($1, $2, $3, $4, $5) AS result",
                    values: [admin_id, event.event_name, event.venue, event.team_id, event.category_id],
                };

                const result = await client.query(query);

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

                return response;
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to add new event.");
            } finally {
                client.release(); 
            }
        },
        updateEvent: async (_, { admin_id, event_id, event }, context) => { 

            if (context.type == "error") {
                return {
                  type: "error",
                  message: "Token expired.",
                };
            }

            const client = await pool.connect(); 

            try {
                let response = {
                    type: "",
                    message: "",
                };

                const query = {
                    text: "SELECT * FROM fn_admin_update_event($1, $2, $3, $4, $5, $6) AS result",
                    values: [admin_id, event_id, event.event_name, event.venue, event.team_id, event.category_id],
                };

                const result = await client.query(query);

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

                return response;
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to update the event.");
            } finally {
                client.release(); 
            }
        },
        deleteEvent: async (_, { admin_id, event_id }, context) => { 

            if (context.type == "error") {
                return {
                  type: "error",
                  message: "Token expired.",
                };
            }

            const client = await pool.connect(); 

            try {
                let response = {
                    type: "",
                    message: "",
                };

                const query = {
                    text: "SELECT * FROM fn_admin_delete_event($1, $2) AS result", 
                    values: [admin_id, event_id],
                };

                const result = await client.query(query);

                if (result && result.rows.length > 0) {
                    const res = result.rows[0].result;
                    if (res) {
                        response = {
                            type: res.type,
                            message: res.message,
                        };
                    }
                }

                return response;
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to delete the event.");
            } finally {
                client.release(); 
            }
        },
    },
};
