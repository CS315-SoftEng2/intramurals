import { GraphQLScalarType, Kind } from "graphql";

export const DateScalar = new GraphQLScalarType({
  name: "Date",
  description: "A custom scalar that handles date values",
  serialize(value) {
    return value instanceof Date ? value.toISOString() : null;
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

const parseDateFromPostgres = (value) => {
  return new Date(value); 
};

export const CustomDateTimeScalar = new GraphQLScalarType({
  name: "CustomDateTime",
  description:
    "A custom date and time string in the format YYYY-MM-DD HH:mm:ss.ssssss",
  parseValue(value) {
    return parseDateFromPostgres(value);
  },
  serialize(value) {
    return formatDateToISO(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return parseDateFromPostgres(ast.value); 
    }
    return null; 
  },
});
