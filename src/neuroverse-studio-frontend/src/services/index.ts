import { NeuroService } from "./neuro.service";
import { AuthService } from "./auth.service";
import { Principal } from "@dfinity/principal";

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

    // if (!agent) {
    //   console.error("Cannot create services without a valid Agent!");
    //   return;
    // }

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

  async login() {
    const result = await this.authService.loginWithIcp();
    this.createAllServices();
    return result;
  }

  async logout() {
    await this.authService.logout();

    // clear the defined service
    this.neuroService = undefined;

    //refresh the created services
    this.createAllServices();
  }

  isAuthenticated(): Promise<boolean> {
    return this.authService.isAuthenticated();
  }

  getPrincipal(): Principal {
    return this.authService.getPrincipal();
  }
}

export const serviceFactory = new ServiceFactory();
