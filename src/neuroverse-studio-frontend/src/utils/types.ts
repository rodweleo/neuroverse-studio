import { Principal } from "@dfinity/principal";

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
  to: Principal;
  from: Principal;
  canisterId?: string;
  amount: bigint;
  fee: bigint;
  memo?: number;
  from_subaccount?: string;
  created_at_time?: string;
};

export type ContractResult<T> =
  | {
      ok: T;
    }
  | {
      err: string;
    };

export type TokenTransferStatus =
  | "idle"
  | "preview"
  | "processing"
  | "success"
  | "error";

// Types matching the Motoko backend
export type Document = {
  id: string;
  filename: string;
  content_type: string;
  encrypted_data: Uint8Array;
  owner: Principal;
  whitelist: Principal[];
  created_at: bigint;
  updated_at: bigint;
  size: bigint;
};

export type DocumentInfo = {
  id: string;
  filename: string;
  content_type: string;
  owner: Principal;
  whitelist: Principal[];
  created_at: bigint;
  updated_at: bigint;
  size: bigint;
  can_access: boolean;
};

export type CreateDocumentRequest = {
  filename: string;
  content_type: string;
  encrypted_data: Uint8Array;
  whitelist: Principal[];
};

export type UpdateWhitelistRequest = {
  document_id: string;
  whitelist: Principal[];
};

export type UploadProgress = {
  loaded: number;
  total: number;
  percentage: number;
};

export type AccountToAccountIcrc1TokenTransfer = {
  from: Principal;
  to: Principal;
  amount: number | bigint;
  decimals?: number;
};
