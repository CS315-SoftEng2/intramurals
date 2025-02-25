import pkg from "pg";
const { Client } = pkg;

const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "Intramurals",
    password: "admin",
    port: "5432",
});

export default client;