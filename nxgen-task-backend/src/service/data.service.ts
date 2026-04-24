import type { DataWhereInput } from "../../generated/prisma/models.js";
import { prisma } from "../utils/prisma.js";

export type CreateDataInput = {
  metric: string;
  unit: string;
  value: number;
  timestamp?: Date;
};

export type ListDataQuery = {
  from?: Date;
  to?: Date;
  limit?: number;
};

const ensureDeviceExists = async (deviceId: string) => {
  const exists = await prisma.device.findUnique({
    where: { id: deviceId },
    select: { id: true },
  });

  if (!exists) {
    throw new Error("Device not found");
  }
};

export const dataService = {
  async create(deviceId: string, input: CreateDataInput) {
    await ensureDeviceExists(deviceId);

    return prisma.data.create({
      data: {
        device_id: deviceId,
        metric: input.metric,
        unit: input.unit,
        value: input.value,
        timestamp: input.timestamp ?? new Date(),
      },
    });
  },

  async list(deviceId: string, query: ListDataQuery) {
    await ensureDeviceExists(deviceId);

    const { from, to, limit } = query;
    const where: DataWhereInput = { device_id: deviceId };

    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = from;
      if (to) where.timestamp.lte = to;
    }

    return prisma.data.findMany({
      where,
      orderBy: { timestamp: "desc" },
    });
  },
};
