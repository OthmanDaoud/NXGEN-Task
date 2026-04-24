import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { devicesService } from "../services/devices.service";
import type { CreateDeviceInput } from "../types/device";

export const devicesQueryKey = ["devices"] as const;

export function useDevices() {
  return useQuery({
    queryKey: devicesQueryKey,
    queryFn: () => devicesService.listDevices(),
  });
}

export function useCreateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDeviceInput) => devicesService.createDevice(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: devicesQueryKey });
    },
  });
}
