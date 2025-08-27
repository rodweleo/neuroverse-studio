import getAllAgents from "@/functions/getAllAgents";
import { useQuery } from "@tanstack/react-query";

const useAllAgents = () => {
  return useQuery({
    queryKey: ["neuroverse-agents"],
    queryFn: async () => {
      const agents = await getAllAgents();
      return agents;
    },
    refetchOnWindowFocus: false,
    staleTime: 2500,
  });
};

export default useAllAgents;
