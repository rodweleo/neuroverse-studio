import { useAuth } from "@/contexts/use-auth-client";
import { NeuroService } from "./neuro.service";
import { AuthService } from "./auth.service";

export class ServiceFactory {
  private neuroService?: NeuroService;
  private authService?: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async initialize() {
    await this.authService.initAuth();
    this.createAllServices();
  }

  private createAllServices() {
    const agent = this.authService.getAgent();
    const identity = this.authService.getIdentity();

    if (!agent) {
      console.error("Cannot create services without a valid Agent!");
      return;
    }

    if (identity) {
      this.neuroService = new NeuroService(
        process.env.CANISTER_ID_ICRC1_LEDGER_CANISTER!,
        agent!,
        identity!
      );
    }
  }

  getNeuroService(): NeuroService {
    if (!this.neuroService) {
      throw new Error("NEURO service not available. Kindly check.");
    }
    return this.neuroService;
  }

  async login() {
    const result = await this.authService.login();

    this.createAllServices();
    return result;
  }

  async logout() {
    this.neuroService = undefined;
    this.createAllServices();
  }

  isAuthenticated(): Promise<boolean> {
    return this.authService.isAuthenticated();
  }

  getPrincipal(): string | undefined {
    return this.authService.getPrincipal();
  }
}

export const serviceFactory = new ServiceFactory();
