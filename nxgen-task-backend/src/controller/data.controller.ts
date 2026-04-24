import type { RequestHandler } from "express";
import { dataService } from "../service/data.service.js";
import { parseDate, parseNumber } from "../utils/conversion.js";

export const createDataController: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { metric, unit, value, timestamp } = req.body;

    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }

    if (!metric) {
      return res.status(400).json({ error: "metric is required" });
    }

    if (!unit) {
      return res.status(400).json({ error: "unit is required" });
    }

    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      return res
        .status(400)
        .json({ error: "value is required and must be a number" });
    }

    const parsedTimestamp = parseDate(timestamp);

    const reading = await dataService.create(id as string, {
      metric,
      unit,
      value: numericValue,
      timestamp: parsedTimestamp ?? new Date(),
    });
    return res.status(201).json(reading);
  } catch (error) {
    return res.status(400).json({ error: "Invalid request" });
  }
};

export const listDataController: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }

    const limit = parseNumber(req.query.limit);
    const from = parseDate(req.query.from);
    const to = parseDate(req.query.to);

    const data = await dataService.list(id as string, {
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...(limit ? { limit } : {}),
    });

    return res.json(data);
  } catch {
    return res.status(400).json({ error: "Invalid request" });
  }
};
