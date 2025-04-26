import { pool } from "../helpers/dbHelper.js";
import {
  CustomDateTimeScalar,
  DateScalar,
  DateTimeScalar,
  TimeScalar,
} from "../helpers/scalarHandler.js";

const combineDateTime = (date, time) => {
  const combinedDateTime = `${date} ${time}`;
  const dateObject = new Date(combinedDateTime);
  const localDateTime = new Date(
    dateObject.getTime() - dateObject.getTimezoneOffset() * 60000
  );
  return localDateTime;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(":");
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

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

        return result.rows.map((row) => {
          const customDateTime = combineDateTime(row.date, row.start_time);

          return {
            schedule_id: row.schedule_id,
            date: formatDate(row.date),
            start_time: formatTime(row.start_time),
            end_time: formatTime(row.end_time),
            customDateTime,
            event_id: row.event_id,
            category_id: row.category_id,
          };
        });
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
        const row = result.rows[0];

        const customDateTime = combineDateTime(row.date, row.start_time);

        return {
          schedule_id: row.schedule_id,
          date: formatDate(row.date),
          start_time: formatTime(row.start_time),
          end_time: formatTime(row.end_time),
          customDateTime,
          event_id: row.event_id,
          category_id: row.category_id,
        };
      } catch (err) {
        console.error("Error:", err);
        throw new Error("Failed to fetch the schedule.");
      } finally {
        client.release();
      }
    },
  },

  Mutation: {
    // Mutations unchanged - these can keep sending raw values to the DB
    // No need to format them unless you return data (currently not the case)

    addSchedule: async (_, { admin_id, schedule }, context) => {
      if (context.type == "error") {
        return {
          type: "error",
          message: "Token expired.",
        };
      }

      const client = await pool.connect();

      try {
        const query = {
          text: "SELECT fn_admin_add_schedule($1, $2, $3, $4, $5, $6) AS result",
          values: [
            admin_id,
            schedule.date,
            schedule.start_time,
            schedule.end_time,
            schedule.event_id,
            schedule.category_id,
          ],
        };

        const result = await client.query(query);
        const res = result.rows[0]?.result;

        return res
          ? {
              content: res.content,
              type: res.type,
              message: res.message,
            }
          : {
              content: null,
              type: "error",
              message: "Failed to add schedule.",
            };
      } catch (err) {
        console.error("Error:", err);
        throw new Error("Failed to add new schedule.");
      } finally {
        client.release();
      }
    },

    updateSchedule: async (_, { admin_id, schedule_id, schedule }, context) => {
      if (context.type == "error") {
        return {
          type: "error",
          message: "Token expired.",
        };
      }

      const client = await pool.connect();

      try {
        const query = {
          text: "SELECT * FROM fn_admin_update_schedule($1, $2, $3, $4, $5, $6, $7) AS result",
          values: [
            admin_id,
            schedule_id,
            schedule.date,
            schedule.start_time,
            schedule.end_time,
            schedule.event_id,
            schedule.category_id,
          ],
        };

        const result = await client.query(query);
        const res = result.rows[0]?.result;

        return res
          ? {
              type: res.type,
              message: res.message,
            }
          : {
              type: "error",
              message: "Failed to update schedule.",
            };
      } catch (err) {
        console.error("Error:", err);
        throw new Error("Failed to update the schedule.");
      } finally {
        client.release();
      }
    },

    deleteSchedule: async (_, { admin_id, schedule_id }, context) => {
      if (context.type == "error") {
        return {
          type: "error",
          message: "Token expired.",
        };
      }

      const client = await pool.connect();

      try {
        const query = {
          text: "SELECT * FROM fn_admin_delete_schedule($1, $2) AS result",
          values: [admin_id, schedule_id],
        };

        const result = await client.query(query);
        const res = result.rows[0]?.result;

        return res
          ? {
              type: res.type,
              message: res.message,
            }
          : {
              type: "error",
              message: "Failed to delete schedule.",
            };
      } catch (err) {
        console.error("Error:", err);
        throw new Error("Failed to delete the schedule.");
      } finally {
        client.release();
      }
    },
  },
};
