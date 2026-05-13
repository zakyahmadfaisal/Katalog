import pkg from "pg";

const { Pool } = pkg;

export const pool = new Pool({
  user: "api_user",
  host: "localhost",
  database: "catalog",
  password: "123456",
  port: 5432,
});
