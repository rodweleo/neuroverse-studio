import { HttpAgent, Identity } from "@dfinity/agent";
import {
  Account,
  Allowance,
  AllowanceArgs,
  ApproveArgs,
  ApproveResult,
  MetadataValue,
  _SERVICE as NeuroContract,
  Tokens,
  TransferArg,
  TransferFromArgs,
  TransferFromResult,
  TransferResult,
} from "../../../declarations/icrc1_ledger_canister/icrc1_ledger_canister.did";
import { Principal } from "@dfinity/principal";
import { ApiError, BaseService } from "./base.service";
import { idlFactory as NeuroIdlFactory } from "../../../declarations/icrc1_ledger_canister";

export class NeuroService extends BaseService {
  private actor?: NeuroContract;

  constructor(
    private canisterId: string,
    agent: HttpAgent,
    identity: Identity
  ) {
    super(agent, identity);
    this.initializeActor();
  }

  private initializeActor() {
    try {
      if (!this.canisterId) {
        throw new Error("NEURO canister ID not provided");
      }
      this.actor = this.createActor<NeuroContract>(
        this.canisterId,
        NeuroIdlFactory
      );
    } catch (error) {
      console.error("Failed to initialize icrc1 actor:", error);
      throw new ApiError("Failed to initialize icrc1 service", "INIT_ERROR");
    }
  }

  private getActor(): NeuroContract {
    if (!this.actor) {
      throw new Error("Neuro actor not initialized");
    }
    return this.actor;
  }

  // Core ICRC1 methods
  async getBalance(account: Account): Promise<Tokens> {
    try {
      const actor = this.getActor();
      return await actor.icrc1_balance_of(account);
    } catch (error) {
      this.handleError(error);
    }
  }

  async transfer(args: TransferArg): Promise<TransferResult> {
    try {
      const actor = this.getActor();
      return await actor.icrc1_transfer(args);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getTotalSupply(): Promise<Tokens> {
    try {
      const actor = this.getActor();
      return await actor.icrc1_total_supply();
    } catch (error) {
      this.handleError(error);
    }
  }

  async getDecimals(): Promise<number> {
    try {
      const actor = this.getActor();
      return await actor.icrc1_decimals();
    } catch (error) {
      this.handleError(error);
    }
  }

  async getFee(): Promise<Tokens> {
    try {
      const actor = this.getActor();
      return await actor.icrc1_fee();
    } catch (error) {
      this.handleError(error);
    }
  }

  async getName(): Promise<string> {
    try {
      const actor = this.getActor();
      return await actor.icrc1_name();
    } catch (error) {
      this.handleError(error);
    }
  }

  async getSymbol(): Promise<string> {
    try {
      const actor = this.getActor();
      return await actor.icrc1_symbol();
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMetadata(): Promise<Array<[string, MetadataValue]>> {
    try {
      const actor = this.getActor();
      return await actor.icrc1_metadata();
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMintingAccount(): Promise<Account | null> {
    try {
      const actor = this.getActor();
      const result = await actor.icrc1_minting_account();
      return result.length > 0 ? result[0]! : null;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ICRC2 methods (approve/allowance)
  async approve(args: ApproveArgs): Promise<ApproveResult> {
    try {
      const actor = this.getActor();
      return await actor.icrc2_approve(args);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAllowance(args: AllowanceArgs): Promise<Allowance> {
    try {
      const actor = this.getActor();
      return await actor.icrc2_allowance(args);
    } catch (error) {
      this.handleError(error);
    }
  }

  async transferFrom(args: TransferFromArgs): Promise<TransferFromResult> {
    try {
      const actor = this.getActor();
      return await actor.icrc2_transfer_from(args);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Utility methods
  createAccount(principal: Principal, subaccount?: Uint8Array): Account {
    return {
      owner: principal,
      subaccount: subaccount ? [subaccount] : [],
    };
  }

  createTransferArgs(
    to: Account,
    amount: Tokens,
    memo?: Uint8Array,
    fee?: Tokens
  ): TransferArg {
    return {
      to,
      amount,
      memo: memo ? [memo] : [],
      fee: fee ? [fee] : [],
      from_subaccount: [],
      created_at_time: [],
    };
  }

  createApproveArgs(
    spender: Account,
    amount: Tokens,
    fee?: Tokens,
    memo?: Uint8Array,
    expiresAt?: bigint,
    expectedAllowance?: Tokens
  ): ApproveArgs {
    return {
      spender,
      amount,
      fee: fee ? [fee] : [],
      memo: memo ? [memo] : [],
      from_subaccount: [],
      created_at_time: [],
      expires_at: expiresAt ? [expiresAt] : [],
      expected_allowance: expectedAllowance ? [expectedAllowance] : [],
    };
  }

  // Helper methods for frontend usage
  formatTokens(amount: Tokens, decimals: number): string {
    const divisor = BigInt(10 ** decimals);
    const integerPart = amount / divisor;
    const fractionalPart = amount % divisor;

    if (fractionalPart === 0n) {
      return integerPart.toString();
    }

    const fractionalStr = fractionalPart.toString().padStart(decimals, "0");
    const trimmed = fractionalStr.replace(/0+$/, "");

    return `${integerPart}${trimmed ? "." + trimmed : ""}`;
  }

  parseTokens(amount: string, decimals: number): Tokens {
    const [integerPart, fractionalPart = ""] = amount.split(".");
    const paddedFractional = fractionalPart
      .padEnd(decimals, "0")
      .slice(0, decimals);
    const fullString = integerPart + paddedFractional;
    return BigInt(fullString);
  }

  convertToNumber(amount: Tokens): number {
    return this.convertBigIntToNumber(amount);
  }

  isTransferSuccess(result: TransferResult): boolean {
    return "Ok" in result;
  }

  isApproveSuccess(result: ApproveResult): boolean {
    return "Ok" in result;
  }

  getTransferError(result: TransferResult): string | null {
    if ("Err" in result) {
      const error = result.Err;
      if ("InsufficientFunds" in error) {
        return `Insufficient funds. Balance: ${error.InsufficientFunds.balance}`;
      }
      if ("BadFee" in error) {
        return `Bad fee. Expected: ${error.BadFee.expected_fee}`;
      }
      if ("TooOld" in error) {
        return "Transaction too old";
      }
      if ("CreatedInFuture" in error) {
        return "Transaction created in future";
      }
      if ("TemporarilyUnavailable" in error) {
        return "Service temporarily unavailable";
      }
      if ("Duplicate" in error) {
        return `Duplicate transaction. Original: ${error.Duplicate.duplicate_of}`;
      }
      if ("GenericError" in error) {
        return error.GenericError.message;
      }
    }
    return null;
  }
}
