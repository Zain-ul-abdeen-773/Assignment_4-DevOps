const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",
  database: process.env.PGDATABASE || "ai_model_registry",
  port: Number(process.env.PGPORT || 5432)
});

const ensureSchema = async () => {
  const ddl = `
    CREATE TABLE IF NOT EXISTS models (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      framework TEXT NOT NULL,
      task_type TEXT NOT NULL,
      accuracy NUMERIC(5,2) NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
      status TEXT NOT NULL,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
    );
  `;

  await pool.query(ddl);
};

module.exports = { pool, ensureSchema };
