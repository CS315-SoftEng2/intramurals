import { pool } from '../helpers/dbHelper.js';
import {
    CustomDateTimeScalar,
    DateScalar,
    DateTimeScalar,
    TimeScalar,
  } from "../helpers/scalarHandler.js";

export const scheduleResolver = {
    Date: DateScalar, 
    Time: TimeScalar, 
    DateTime: DateTimeScalar, 
    CustomDateTime: CustomDateTimeScalar,
    Query: {
        schedules: async () => {

            const client = await pool.connect();

            try {
                const query = {
                    text: "SELECT * FROM schedule",
                };

                const result = await client.query(query);
                console.log("Result:", result.rows);
                return result.rows;
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to fetch schedules.");
            } finally {
                client.release();
            }
        },
        schedule: async (_, { id }) => {

            const client = await pool.connect();

            try {
                const query = {
                    text: "SELECT * FROM schedule WHERE schedule_id = $1",
                    values: [id],
                };

                const result = await client.query(query);
                console.log("Result:", result.rows);
                return result.rows[0];
            } catch (err) {
                console.error("Error:", err);
                throw new Error("Failed to fetch the schedule.");
            } finally {
                client.release();
            }
        },
    },
    Mutation: {
            addSchedule: async (_, { admin_id, schedule }) => {
        
                const client = await pool.connect(); 
                
                try {
                    let response = {
                        content: null,
                        type: "",
                        message: "",
                    };  
        
                    const query = {
                        text: "SELECT fn_admin_add_schedule($1, $2, $3, $4, $5) AS result",
                        values: [admin_id, schedule.date, schedule.start_time, schedule.end_time, schedule.event_id],
                    };
        
                    const result = await client.query(query);
        
                    if (result && result.rows.length > 0) {
                        const res = result.rows[0].result;
                        console.log("Added schedule result: ", res);
        
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
                    throw new Error("Failed to add new schedule.");
                } finally {
                    client.release();
                }
            },

        updateSchedule: async (_, { admin_id, schedule_id, schedule }) => {

            const client = await pool.connect();

            try {

                let response = {
                    type: "",
                    message: "",
                };

                const query = {
                    text: "SELECT * FROM fn_admin_update_schedule($1, $2, $3, $4, $5, $6) AS result",
                    values: [admin_id, schedule_id, schedule.date, schedule.start_time, schedule.end_time, schedule.event_id],
                };

                const result = await client.query(query);

                if (result && result.rows.length > 0) {
                    const res = result.rows[0].result;
                    console.log("Updated schedule result: ", res);
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
                throw new Error("Failed to update the schedule.");
            } finally {
                await client.end();
            }
        },
        deleteSchedule: async (_, { admin_id, schedule_id }) => {

            const client = await pool.connect();

            try {

                let response = {
                    type: "",
                    message: "",
                  };

                const query = {
                    text: "SELECT * FROM fn_admin_delete_schedule($1, $2) AS result",
                    values: [admin_id, schedule_id],
                };

                const result = await client.query(query);

                if (result && result.rows.length > 0) {
                    const res = result.rows[0].result;
                    console.log("Deleted schedule result: ", res);
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
                throw new Error("Failed to delete the schedule.");
            } finally {
                await client.end();
            }
        },
    },
};