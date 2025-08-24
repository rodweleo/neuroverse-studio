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
  to: string;
  amount: number;
  opts: {
    canisterId: string; // ICRC or native token canister ID
    fee?: number;
    memo?: number;
    from_subaccount: null;
    created_at_time: {
      timestamp_nanos: null;
    };
  };
};
