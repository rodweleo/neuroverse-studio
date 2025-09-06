import getUserAgentsByPrincipal from "@/functions/getUserAgentsByPrincipal";
import { useQuery } from "@tanstack/react-query";
import { Principal } from "@dfinity/principal";

const useUserAgents = (userPrincipal: Principal) => {
  return useQuery({
    queryKey: ["neuroverse-user-agents"],
    queryFn: async () => {
      const agents = await getUserAgentsByPrincipal(userPrincipal);
      return agents;
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
};

export default useUserAgents;
