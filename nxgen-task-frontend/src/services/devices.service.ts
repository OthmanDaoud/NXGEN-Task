import { api } from "./api";
import type { CreateDeviceInput, Device } from "../types/device";

export const devicesService = {
  listDevices() {
    return api.get<Device[]>("/devices");
  },
  createDevice(input: CreateDeviceInput) {
    return api.post<Device>("/devices", input);
  },
};
