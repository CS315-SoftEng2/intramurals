import { GraphQLScalarType, Kind } from "graphql";
import pg from "pg";

pg.types.setTypeParser(1082, (val) => val);

export const DateScalar = new GraphQLScalarType({
  name: "Date",
  description: "A custom scalar that handles date values",
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString().split("T")[0];
    }
    if (typeof value === "string") {
      return value;
    }
    return null;
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

export const TimeScalar = new GraphQLScalarType({
  name: "Time",
  description: "A time string in the format HH:mm:ss",
  parseValue(value) {
    return value;
  },
  serialize(value) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  },
});

export const DateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  description: "A date and time string in ISO 8601 format",
  parseValue(value) {
    return new Date(value);
  },
  serialize(value) {
    return value.toISOString();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

const formatDateToISO = (date) => {
  return date.toISOString();
};

const parseCustomDateTimeFromPostgres = (date, time) => {
  const combinedDateTime = `${date} ${time}`;
  return new Date(combinedDateTime);
};

export const CustomDateTimeScalar = new GraphQLScalarType({
  name: "CustomDateTime",
  description:
    "A custom date and time string in the format YYYY-MM-DD HH:mm:ss.ssssss",
  parseValue(value) {
    return parseCustomDateTimeFromPostgres(value.date, value.start_time);
  },
  serialize(value) {
    return formatDateToISO(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      const [date, time] = ast.value.split(" ");
      return parseCustomDateTimeFromPostgres(date, time);
    }
    return null;
  },
});

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(":");
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
