import { AuthClient } from "@dfinity/auth-client";
import {
  Account,
  AccountIdentifier,
  Icrc1TransferRequest,
  LedgerCanister,
} from "@dfinity/ledger-icp";
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { HttpAgent } from "@dfinity/agent";
import { IcrcLedgerCanisterOptions } from "@dfinity/ledger-icrc/dist/types/types/canister.options";
import { _SERVICE } from "@dfinity/ledger-icrc/dist/candid/icrc_ledger";
import { createAgent } from "@dfinity/utils";

class TokenLedgerCanister {
  constructor() {}

  initAuthClient = async () => {
    const authClient = await AuthClient.create();
    return authClient;
  };

  initIcpLedger = async (ledgerCanisterId?: string) => {
    try {
      const authClient = await this.initAuthClient();

      const canisterId = ledgerCanisterId
        ? ledgerCanisterId
        : "ryjl3-tyaaa-aaaaa-aaaba-cai";

      const LEDGER_CANISTER_ID: Principal = Principal.fromText(canisterId);

      if (await authClient.isAuthenticated()) {
        const identity = authClient.getIdentity();

        const isLocalDevelopment = process.env.DFX_NETWORK !== "ic";

        const agent = await HttpAgent.create({
          identity,
          host: isLocalDevelopment
            ? "http://localhost:4943"
            : "https://ic0.app",
        });

        if (isLocalDevelopment) {
          await agent.fetchRootKey();
        }

        const ledger = LedgerCanister.create({
          agent,
          canisterId: LEDGER_CANISTER_ID,
        });

        return ledger;
      } else {
        //trigger a fresh authenticaion using internet identity

        throw new Error("User not authenticated.");
      }
    } catch (e) {
      console.error("Error initializing ICP ledger:", e);
      return null;
    }
  };

  getIcpBalances = async () => {
    const icpLedger = await this.initIcpLedger();

    const authClient = await this.initAuthClient();
    const identity = authClient.getIdentity();
    const principal = identity.getPrincipal();

    if (!icpLedger) {
      return BigInt(0);
    }

    const ledgerBalance =
      (await icpLedger.accountBalance({
        accountIdentifier: AccountIdentifier.fromPrincipal({
          principal: principal,
        }),
        certified: true,
      })) || BigInt(0);

    return ledgerBalance;
  };

  transferIcpToken = async (toPrincipal: string, amount: number) => {
    const ledgerCanister = await this.initIcpLedger();

    if (!ledgerCanister) return;

    const toAccount: Account = {
      owner: Principal.fromText(toPrincipal),
      subaccount: [], // default subaccount
    };

    const transferAmount = BigInt(Math.floor(amount * 100000000)); // Convert to e8s

    const request: Icrc1TransferRequest = {
      to: toAccount,
      amount: transferAmount,
      createdAt: BigInt(Date.now() * 1000000), // Convert to nanoseconds
    };

    try {
      const blockHeight = await ledgerCanister.icrc1Transfer(request);
      return blockHeight;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  initIcrcLedger = async (
    ledgerCanisterId?: string
  ): Promise<IcrcLedgerCanister> => {
    try {
      const authClient = await this.initAuthClient();

      const canisterId = ledgerCanisterId
        ? ledgerCanisterId
        : process.env.CANISTER_ID_ICRC1_LEDGER_CANISTER;

      if (await authClient.isAuthenticated()) {
        const identity = authClient.getIdentity();

        const isLocalDevelopment = process.env.DFX_NETWORK !== "ic";
        const host = isLocalDevelopment
          ? "http://localhost:4943"
          : "https://ic0.app";

        const agent = await createAgent({
          identity,
          host,
        });

        if (isLocalDevelopment) {
          await agent.fetchRootKey();
        }

        const ledgerOptions: IcrcLedgerCanisterOptions<_SERVICE> = {
          agent,
          canisterId: Principal.fromText(canisterId),
        };
        const ledger = IcrcLedgerCanister.create(ledgerOptions);

        return ledger;
      } else {
        //trigger a fresh authenticaion using internet identity
        throw new Error("User not authenticated.");
      }
    } catch (e) {
      console.error("Error initializing ICRC ledger:", e);
      return null;
    }
  };

  transferIcrcToken = async (
    toPrincipal: string,
    amount: number,
    ledgerCanisterId?: string
  ) => {
    const icrcLedger = await this.initIcrcLedger(ledgerCanisterId);
    if (!icrcLedger) return null;

    const transferAmount = BigInt(Math.floor(amount * 100000000));

    const blockHeight = await icrcLedger.transfer({
      to: { owner: Principal.fromText(toPrincipal), subaccount: [] },
      amount: transferAmount,
    });

    return blockHeight;
  };
}

export default TokenLedgerCanister;
