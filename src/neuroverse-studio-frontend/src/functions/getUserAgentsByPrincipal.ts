import NeuroverseBackendActor from "@/utils/NeuroverseBackendActor";
import { Principal } from "@dfinity/principal";

const getUserAgentsByPrincipal = async (userPrincipal: Principal) => {
  if (!userPrincipal) {
    return [];
  }

  try {
    const agents = await NeuroverseBackendActor.getAgentsForUser(userPrincipal);
    return agents;
  } catch (e) {
    console.log(e);
    return [];
  }
};

export default getUserAgentsByPrincipal;
