require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ensureSchema, pool } = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: clientOrigin,
    credentials: true
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/models", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM models ORDER BY created_at DESC;"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching models:", error);
    res.status(500).json({ error: "Failed to fetch models." });
  }
});

app.post("/api/models", async (req, res) => {
  const { name, framework, task_type, accuracy, status } = req.body;

  if (!name || !framework || !task_type || accuracy === undefined || !status) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const numericAccuracy = Number(accuracy);
  if (Number.isNaN(numericAccuracy) || numericAccuracy < 0 || numericAccuracy > 100) {
    return res
      .status(400)
      .json({ error: "Accuracy must be a number between 0 and 100." });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO models (name, framework, task_type, accuracy, status) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
      [name, framework, task_type, numericAccuracy, status]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creating model:", error);
    res.status(500).json({ error: "Failed to create model." });
  }
});

if (require.main === module) {
  ensureSchema()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Failed to start server:", error);
      process.exit(1);
    });
}

module.exports = app;
