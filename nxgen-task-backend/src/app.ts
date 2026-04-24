import express from "express";
import cors from "cors";
import { deviceRoutes } from "./routes/device.routes.js";
import { dataRoutes } from "./routes/data.routes.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(deviceRoutes);
  app.use(dataRoutes);

  return app;
}
