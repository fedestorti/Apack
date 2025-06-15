import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "Camaro123",
  database: "apack",
  port: 3000
});

