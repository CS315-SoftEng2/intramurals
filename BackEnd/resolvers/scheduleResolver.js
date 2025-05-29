import { pool } from "../helpers/dbHelper.js";
import {
  CustomDateTimeScalar,
  DateScalar,
  DateTimeScalar,
  TimeScalar,
} from "../helpers/scalarHandler.js";

// Combines date and time into a local datetime object.
const combineDateTime = (date, time) => {
  const combinedDateTime = `${date} ${time}`;
  const dateObject = new Date(combinedDateTime);
  return new Date(
    dateObject.getTime() - dateObject.getTimezoneOffset() * 60000
  );
};

// Formats a date string into a readable format (e.g., "Monday, May 18, 2025").
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// Formats a time string into a readable format (e.g., "9:44 PM").
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

// Handles schedule-related queries and mutations.
export const scheduleResolver = {
  Date: DateScalar,
  Time: TimeScalar,
  DateTime: DateTimeScalar,
  CustomDateTime: CustomDateTimeScalar,

  Query: {
    // Gets all schedules from the database.
    schedules: async () => {
      const client = await pool.connect();

      try {
        // Queries all schedules.
        const query = { text: "SELECT * FROM schedule" };
        const result = await client.query(query);

        // Formats and returns the schedule list.
        return result.rows.map((row) => ({
          schedule_id: row.schedule_id,
          date: formatDate(row.date),
          start_time: formatTime(row.start_time),
          end_time: formatTime(row.end_time),
          customDateTime: combineDateTime(row.date, row.start_time),
          event_id: row.event_id,
          category_id: row.category_id,
        }));
      } catch (err) {
        // Logs and throws error.
        console.error("Error:", err);
        throw new Error("Failed to fetch schedules.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },

    // Gets a schedule by ID.
    schedule: async (_, { id }) => {
      const client = await pool.connect();

      try {
        // Queries a schedule by ID.
        const query = {
          text: "SELECT * FROM schedule WHERE schedule_id = $1",
          values: [id],
        };
        const result = await client.query(query);
        const row = result.rows[0];

        // Formats and returns the schedule.
        return {
          schedule_id: row.schedule_id,
          date: formatDate(row.date),
          start_time: formatTime(row.start_time),
          end_time: formatTime(row.end_time),
          customDateTime: combineDateTime(row.date, row.start_time),
          event_id: row.event_id,
          category_id: row.category_id,
        };
      } catch (err) {
        // Logs and throws error.
        console.error("Error:", err);
        throw new Error("Failed to fetch the schedule.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },
  },

  Mutation: {
    // Adds a new schedule.
    addSchedule: async (_, { admin_id, schedule }, context) => {
      // Checks for expired token.
      if (context.type == "error") {
        return { type: "error", message: "Token expired." };
      }

      const client = await pool.connect();

      try {
        // Queries to add a schedule.
        const query = {
          text: "SELECT fn_admin_add_schedule($1, $2, $3, $4, $5) AS result",
          values: [
            admin_id,
            schedule.date,
            schedule.start_time,
            schedule.end_time,
            schedule.event_id,
          ],
        };
        const result = await client.query(query);
        const res = result.rows[0]?.result;

        // Returns the query result or an error.
        return res
          ? { content: res.content, type: res.type, message: res.message }
          : {
              content: null,
              type: "error",
              message: "Failed to add schedule.",
            };
      } catch (err) {
        // Logs and throws error.
        console.error("Error:", err);
        throw new Error("Failed to add new schedule.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },

    // Updates an existing schedule.
    updateSchedule: async (_, { admin_id, schedule_id, schedule }, context) => {
      // Checks for expired token.
      if (context.type == "error") {
        return { type: "error", message: "Token expired." };
      }

      const client = await pool.connect();

      try {
        // Queries to update a schedule.
        const query = {
          text: "SELECT * FROM fn_admin_update_schedule($1, $2, $3, $4, $5, $6) AS result",
          values: [
            admin_id,
            schedule_id,
            schedule.date,
            schedule.start_time,
            schedule.end_time,
            schedule.event_id,
          ],
        };
        const result = await client.query(query);
        const res = result.rows[0]?.result;

        // Returns the query result or an error.
        return res
          ? { type: res.type, message: res.message }
          : { type: "error", message: "Failed to update schedule." };
      } catch (err) {
        // Logs and throws error.
        console.error("Error:", err);
        throw new Error("Failed to update the schedule.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },

    // Deletes a schedule.
    deleteSchedule: async (_, { admin_id, schedule_id }, context) => {
      // Checks for expired token.
      if (context.type == "error") {
        return { type: "error", message: "Token expired." };
      }

      const client = await pool.connect();

      try {
        // Queries to delete a schedule.
        const query = {
          text: "SELECT * FROM fn_admin_delete_schedule($1, $2) AS result",
          values: [admin_id, schedule_id],
        };
        const result = await client.query(query);
        const res = result.rows[0]?.result;

        // Returns the query result or an error.
        return res
          ? { type: res.type, message: res.message }
          : { type: "error", message: "Failed to delete schedule." };
      } catch (err) {
        // Logs and throws error.
        console.error("Error:", err);
        throw new Error("Failed to delete the schedule.");
      } finally {
        // Closes the database connection.
        client.release();
      }
    },
  },
};
