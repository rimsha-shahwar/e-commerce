const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ecommerce",
  password: "rimsha2001",
  port: 5432,
});

module.exports = pool;