require("dotenv").config();
const { ensureSchema, pool } = require("./db");

const seedModels = [
  {
    name: "VisionForge CNN",
    framework: "PyTorch",
    task_type: "Image Classification",
    accuracy: 93.4,
    status: "Deployed"
  },
  {
    name: "Chronos LSTM",
    framework: "TensorFlow",
    task_type: "Time Series Forecasting",
    accuracy: 91.2,
    status: "Staging"
  },
  {
    name: "Aurora BERT",
    framework: "Hugging Face",
    task_type: "Text Classification",
    accuracy: 94.7,
    status: "Deployed"
  },
  {
    name: "Atlas GNN",
    framework: "PyTorch Geometric",
    task_type: "Graph Link Prediction",
    accuracy: 88.9,
    status: "Training"
  },
  {
    name: "Nimbus RL Agent",
    framework: "Ray RLlib",
    task_type: "Reinforcement Learning",
    accuracy: 86.3,
    status: "Shadow"
  }
];

const run = async () => {
  await ensureSchema();
  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM models;");

  if (rows[0].count > 0) {
    console.log("Seed skipped: models table already has data.");
    return;
  }

  const insertText = `
    INSERT INTO models (name, framework, task_type, accuracy, status)
    VALUES ($1, $2, $3, $4, $5)
  `;

  for (const model of seedModels) {
    await pool.query(insertText, [
      model.name,
      model.framework,
      model.task_type,
      model.accuracy,
      model.status
    ]);
  }

  console.log("Seed complete: inserted", seedModels.length, "models.");
};

run()
  .catch((error) => {
    console.error("Failed to seed database:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
