import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import { BaseService } from "./base.service";
import { AuthClient } from "@dfinity/auth-client";
import {
  canisterId,
  createActor,
} from "../../../declarations/neuroverse-studio-backend";
import { Principal } from "@dfinity/principal";
import { toast } from "@/components/ui/sonner";

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

const host = development ? "http://localhost:4943" : "https://id.ai";

export class AuthService extends BaseService {
  private authClient?: AuthClient;
  private principal?: Principal;
  private actor: Actor;

  constructor() {
    super();
  }

  initAuth = async () => {
    const client = await AuthClient.create();
    await this.updateClient(client);
  };

  login() {
    this.authClient.login({
      ...defaultOptions,
      onSuccess: async () => {
        const identity = this.authClient.getIdentity();
        this.identity = identity;
        this.principal = identity.getPrincipal();
        await this.initAgentAndActor(identity);
      },
      onError: (err) => {
        toast.error("Login failed", {
          description: err,
        });
      },
    });
  }

  async initAgentAndActor(identity: Identity) {
    const agent = await HttpAgent.create({ identity, host, fetch });
    if (development) await agent.fetchRootKey();
    this.agent = agent;

    const actor = createActor(canisterId as string, { agent });
    this.actor = actor;
  }

  async updateClient(client: AuthClient) {
    if (!client) return;

    this.authClient = client;

    const isAuthenticated = await client.isAuthenticated();

    if (isAuthenticated) {
      const identity = client.getIdentity();
      this.identity = identity;
      this.principal = identity.getPrincipal();
      this.authClient = client;
      await this.initAgentAndActor(identity);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      if (!this.authClient) {
        await this.initAuth();
      }
      return this.authClient ? await this.authClient.isAuthenticated() : false;
    } catch (error) {
      return false;
    }
  }

  getPrincipal(): string | undefined {
    return this.identity?.getPrincipal().toString();
  }

  getAgent(): HttpAgent | undefined {
    return this.agent;
  }

  getIdentity(): Identity | undefined {
    return this.identity;
  }
}

export const authService = new AuthService();
