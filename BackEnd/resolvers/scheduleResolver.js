import client from '../helpers/dbHelper.js';

export const scheduleResolver = {
    Query: {
        schedules: async () => {
            try {
                const query = {
                    text: "SELRCT * FROM schedule",
                };
                const result = await client.query(query);
                return result.rows;
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to fetch schedules.");
            }
        },
        schedule: async (_, { id }) => {
            try {
                const query = {
                    text: "SELECT * FROM schedule WHERE schedule_id = $1",
                    values: [id],
                };
                const result = await client.query(query);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to fetch the schedule.");
            }
        },
    },
    Mutation: {
        addSchedule: async (_, { schedule }) => {
            try {
                const query = {
                    text: "SELECT * FROM fn_admin_add_schedule($1, $2, $3, $4)",
                    values: [schedule.date, schedule.start_time, schedule.end_time, schedule.event_id],
                };
                const result = await client.query(query);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to add new schedule.");
            }
        },
        updateSchedule: async (_, { id, schedule }) => {
            try {
                const query = {
                    text: "SELECT * FROM fn_admin_update_schedule($1, $2, $3, $4, $5)",
                    values: [id, schedule.date, schedule.start_time, schedule.end_time, schedule.event.id],
                };
                const result = await client.query(query);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to update the schedule.");
            }
        },
        deleteSchedule: async (_, { id }) => {
            try {
                const query = {
                    text: "SELECT * FROM fn_admin_delete_schedule($1)",
                    values: [id],
                };
                const result = await client.query(query);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to delete the schedule.");
            }
        },
    },
};