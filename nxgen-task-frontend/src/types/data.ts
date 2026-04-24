export type Reading = {
  id: string;
  device_id: string;
  metric: string;
  unit: string;
  value: number;
  timestamp: string;
};

export type CreateReadingInput = {
  metric: string;
  unit: string;
  value: number;
  timestamp?: string;
};

export type ListDataQuery = {
  from?: string;
  to?: string;
  limit?: number;
};
