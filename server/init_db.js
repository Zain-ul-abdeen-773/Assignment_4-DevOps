require("dotenv").config();
const { ensureSchema, pool } = require("./db");

const run = async () => {
  await ensureSchema();
  console.log("Database schema initialized.");
};

run()
  .catch((error) => {
    console.error("Failed to initialize database schema:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
