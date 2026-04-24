import request from "supertest";
import { createApp } from "../src/app.js";
import { closeDatabase, resetDatabase } from "./setup.js";

describe("device data API", () => {
  const app = createApp();

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it("adds data and retrieves by range", async () => {
    const deviceRes = await request(app).post("/devices").send({ name: "temp-sensor" });
    const deviceId = deviceRes.body.id as string;

    await request(app).post(`/devices/${deviceId}/data`).send({
      metric: "temperature",
      unit: "C",
      value: 25.1,
      timestamp: "2026-01-10T10:00:00.000Z",
    });

    await request(app).post(`/devices/${deviceId}/data`).send({
      metric: "temperature",
      unit: "C",
      value: 24.2,
      timestamp: "2026-01-10T11:00:00.000Z",
    });

    const res = await request(app).get(
      `/devices/${deviceId}/data?from=2026-01-10T09:00:00.000Z&to=2026-01-10T10:30:00.000Z`,
    );

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].value).toBe(25.1);
  });
});
