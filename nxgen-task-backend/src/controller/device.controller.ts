import type { RequestHandler } from "express";
import { deviceService } from "../service/device.service.js";
export const createDeviceController: RequestHandler = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    const device = await deviceService.create({ name });
    return res.status(201).json(device);
  } catch (error) {
    return res.status(400).json({ error: "Invalid request" });
  }
};

export const listDevicesController: RequestHandler = async (_req, res) => {
  try {
    const devices = await deviceService.list();
    return res.json(devices);
  } catch (error) {
    return res.status(400).json({ error: "Invalid request" });
  }
};
