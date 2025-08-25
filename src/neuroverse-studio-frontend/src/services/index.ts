import { useAuth } from "@/contexts/use-auth-client";
import { NeuroService } from "./neuro.service";

export class ServiceFactory {
  private neuroService?: NeuroService;
  constructor() {}

  async initialize() {
    // After auth is initialized, we have an agent, so we can create services
    this.createAllServices();
  }

  private createAllServices() {
    const { agent, identity } = useAuth();

    if (!agent) {
      console.error("Cannot create services without a valid Agent!");
      return;
    }

    this.neuroService = new NeuroService(
      process.env.CANISTER_ID_ICRC1_LEDGER_CANISTER!,
      agent!,
      identity!
    );
  }

  getNeuroService(): NeuroService {
    if (!this.neuroService) {
      throw new Error("NEURO service not available. Kindly check.");
    }
    return this.neuroService;
  }
}

export const serviceFactory = new ServiceFactory();
