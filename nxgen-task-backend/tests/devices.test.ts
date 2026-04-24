import request from "supertest";
import { createApp } from "../src/app.js";
import { closeDatabase, resetDatabase } from "./setup.js";

describe("devices API", () => {
  const app = createApp();

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it("creates a device", async () => {
    const res = await request(app).post("/devices").send({ name: "sensor-a" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: "sensor-a" });
    expect(res.body.id).toBeDefined();
  });

  it("lists devices", async () => {
    await request(app).post("/devices").send({ name: "sensor-a" });
    await request(app).post("/devices").send({ name: "sensor-b" });

    const res = await request(app).get("/devices");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });
});
