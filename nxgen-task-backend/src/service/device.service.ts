import { prisma } from "../utils/prisma.js";

export type CreateDeviceInput = {
  name: string;
};

export const deviceService = {
  create(input: CreateDeviceInput) {
    return prisma.device.create({ data: { name: input.name } });
  },

  list() {
    return prisma.device.findMany({ orderBy: { created_at: "desc" } });
  },
};
