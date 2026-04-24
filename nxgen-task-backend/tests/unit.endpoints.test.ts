import request from "supertest";
import { createApp } from "../src/app.js";

describe("unit: endpoint validation", () => {
  const app = createApp();

  it("POST /devices returns 400 when name is missing", async () => {
    const res = await request(app).post("/devices").send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "name is required" });
  });

  it("POST /devices/:id/data returns 400 when metric is missing", async () => {
    const res = await request(app)
      .post("/devices/any-id/data")
      .send({ unit: "C", value: 25.1 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "metric is required" });
  });
});
