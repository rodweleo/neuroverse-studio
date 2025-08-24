import type { Principal } from "@dfinity/principal";

export type Tool = {
  id: string;
  name: string;
  description: string;
  category: string;
  creator: string;
  type: "free" | "premium" | "token-gated";
  price: number;
  currency: string | null;
  icon: string;
  function_name?: string;
};

export type PlugWalletRequestTransferParams = {
  to: {
    owner: Principal;
    subaccount: any[];
  };
  canisterId: string;
  amount: BigInt;
  fee: BigInt;
  memo?: number;
  from_subaccount?: string;
  created_at_time?: string;
};
