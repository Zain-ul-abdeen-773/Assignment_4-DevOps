const request = require("supertest");
const app = require("../index");
const { pool, ensureSchema } = require("../db");

beforeAll(async () => {
  await ensureSchema();
});

beforeEach(async () => {
  await pool.query("DELETE FROM models;");
});

afterAll(async () => {
  await pool.end();
});

test("GET /api/models returns an array", async () => {
  const response = await request(app).get("/api/models");

  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
});

test("POST /api/models creates a model", async () => {
  const payload = {
    name: "Sentinel CNN",
    framework: "PyTorch",
    task_type: "Image Classification",
    accuracy: 92.6,
    status: "Deployed"
  };

  const response = await request(app).post("/api/models").send(payload);

  expect(response.status).toBe(201);
  expect(response.body.name).toBe(payload.name);
  expect(response.body.framework).toBe(payload.framework);
  expect(Number(response.body.accuracy)).toBeCloseTo(payload.accuracy, 1);
});

test("POST /api/models validates required fields", async () => {
  const response = await request(app).post("/api/models").send({ name: "" });

  expect(response.status).toBe(400);
  expect(response.body.error).toBeTruthy();
});
