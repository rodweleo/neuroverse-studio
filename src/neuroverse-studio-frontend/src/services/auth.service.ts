// src/services/auth.service.ts
import { HttpAgent, Identity } from "@dfinity/agent";
import { BaseService } from "./base.service";
import { AuthClient } from "@dfinity/auth-client";
import {
  canisterId,
  createActor,
} from "../../../declarations/neuroverse-studio-backend";
import { toast } from "@/components/ui/sonner";
import fetch from "isomorphic-fetch";
import { Principal } from "@dfinity/principal";

const development = process.env.DFX_NETWORK !== "ic";
const CANISTER_ID_INTERNET_IDENTITY = process.env.CANISTER_ID_INTERNET_IDENTITY;

const getIdentityProvider = () => {
  if (typeof window !== "undefined") {
    return development
      ? `http://${CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`
      : "https://id.ai";
  }
  return undefined;
};

const defaultOptions = {
  createOptions: {
    idleOptions: {
      disableDefaultIdleCallback: true,
      disableIdle: true,
    },
  },
  loginOptions: {
    identityProvider: getIdentityProvider(),
    maxTimeToLive: BigInt(1) * BigInt(24) * BigInt(3600000000000),
  },
};

const host = development ? "http://127.0.0.1:4943" : "https://id.ai";

export class AuthService extends BaseService {
  private authClient?: AuthClient;
  private whoamiActor: any;
  private accountId?: string;
  private signInMethod = "";

  async initAuth() {
    const client = await AuthClient.create();
    await this.updateClient(client);
  }

  async loginWithIcp() {
    if (!this.authClient) {
      this.authClient = await AuthClient.create();
    }

    return new Promise<void>((resolve, reject) => {
      this.authClient!.login({
        ...defaultOptions.loginOptions,
        onSuccess: async () => {
          const identity = this.authClient!.getIdentity();
          this.identity = identity;
          await this.initAgentAndActor(identity);
          this.signInMethod = "Internet Identity";
          resolve();
        },
        onError: (err) => {
          toast.error("Login failed", { description: String(err) });
          reject(err);
        },
      });
    });
  }

  async loginWithPlug() {
    if (!window.ic?.plug) {
      toast.error("Plug Wallet not available", {
        description: "Please install the Plug extension.",
      });
      throw new Error("Plug not available");
    }

    await window.ic.plug.requestConnect({
      whitelist: [
        process.env.CANISTER_ID_NEUROVERSE_STUDIO_BACKEND!,
        process.env.CANISTER_ID_ICRC1_LEDGER_CANISTER!,
        process.env.CANISTER_ID!,
        process.env.CANISTER_ID_ICP_LEDGER_CANISTER!,
      ],
      host: "https://mainnet.dfinity.network",
    });

    const agent = await window.ic.plug.agent;
    const principal = await window.ic.plug.principalId;
    const accountId = await window.ic.plug.accountId;

    this.agent = agent;
    this.accountId = accountId;
    this.signInMethod = "Plug Wallet";

    return { agent, principal, accountId };
  }

  async loginWithNfid() {
    const client = await AuthClient.create(defaultOptions.createOptions);

    const APP_NAME = "Neuroverse Studio";
    const APP_LOGO = "https://yourapp.com/logo.png";
    const CONFIG_QUERY = `?applicationName=${APP_NAME}&applicationLogo=${APP_LOGO}`;
    const identityProvider = `https://nfid.one/authenticate${CONFIG_QUERY}`;

    return new Promise<void>((resolve, reject) => {
      client.login({
        identityProvider,
        onSuccess: async () => {
          const identity = client.getIdentity();
          this.identity = identity;
          this.authClient = client;
          await this.initAgentAndActor(identity);
          this.signInMethod = "NFID";
          resolve();
        },
        onError: (err) => {
          toast.error("Login failed", { description: String(err) });
          reject(err);
        },
      });
    });
  }

  async logout() {
    if (this.authClient) {
      await this.authClient.logout();
    }
    this.identity = undefined;
    this.agent = undefined;
    this.whoamiActor = undefined;
    this.accountId = undefined;
    this.signInMethod = "";
  }

  private async initAgentAndActor(identity: Identity) {
    const agent = await HttpAgent.create({ identity, host, fetch });
    if (development) await agent.fetchRootKey();
    this.agent = agent;
    this.whoamiActor = createActor(canisterId as string, { agent });
  }

  private async updateClient(client: AuthClient) {
    try {
      if (!client) return;
      this.authClient = client;

      const isAuthenticated = await client.isAuthenticated();
      if (isAuthenticated) {
        const identity = client.getIdentity();
        this.identity = identity;
        await this.initAgentAndActor(identity);
      } else {
        // Create anonymous agent for public queries
        this.agent = HttpAgent.createSync({ host });
      }

      if (development) await this.agent.fetchRootKey();
    } catch (error) {
      this.handleError(error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    if (!this.authClient) {
      await this.initAuth();
    }
    return this.authClient ? await this.authClient.isAuthenticated() : false;
  }

  // Accessors
  getPrincipal(): Principal | undefined {
    return this.identity?.getPrincipal();
  }
  getAgent(): HttpAgent | undefined {
    return this.agent;
  }
  getIdentity(): Identity | undefined {
    return this.identity;
  }
  getWhoamiActor() {
    return this.whoamiActor;
  }
  getAccountId() {
    return this.accountId;
  }
  getSignInMethod() {
    return this.signInMethod;
  }
  getAuthClient() {
    return this.authClient;
  }
  getHost() {
    return host;
  }
}

export const authService = new AuthService();
