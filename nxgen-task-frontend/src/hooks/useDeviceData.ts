import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dataService } from "../services/data.service";
import type { CreateReadingInput, ListDataQuery } from "../types/data";

export function deviceDataQueryKey(deviceId: string, query?: ListDataQuery) {
  return ["device-data", deviceId, query ?? {}] as const;
}

export function useDeviceData(deviceId: string, query?: ListDataQuery) {
  return useQuery({
    queryKey: deviceDataQueryKey(deviceId, query),
    queryFn: () => dataService.listData(deviceId, query),
    enabled: Boolean(deviceId),
  });
}

export function useCreateReading(deviceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReadingInput) =>
      dataService.createReading(deviceId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === "device-data" &&
          query.queryKey[1] === deviceId,
      });
    },
  });
}
