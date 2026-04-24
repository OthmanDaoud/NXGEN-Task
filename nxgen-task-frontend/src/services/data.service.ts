import { api } from "./api";
import type { CreateReadingInput, ListDataQuery, Reading } from "../types/data";

export const dataService = {
  listData(deviceId: string, query?: ListDataQuery) {
    return api.get<Reading[]>(`/devices/${deviceId}/data`, query);
  },
  createReading(deviceId: string, input: CreateReadingInput) {
    return api.post<Reading>(`/devices/${deviceId}/data`, input);
  },
};
