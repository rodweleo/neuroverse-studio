import NeuroverseBackendActor from "@/utils/NeuroverseBackendActor";
import { useQuery } from "@tanstack/react-query";

export const useAllTools = () => {
  return useQuery({
    queryKey: ["neuroverse-tools"],
    queryFn: async () => {
      const tools = await NeuroverseBackendActor.getTools();
      return tools;
    },
  });
};
