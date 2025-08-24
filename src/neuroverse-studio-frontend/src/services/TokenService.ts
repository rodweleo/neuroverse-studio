import { toast } from "@/components/ui/sonner";
import { PlugWalletRequestTransferParams } from "@/utils/types";
import { idlFactory } from "../../../declarations/icrc1_ledger_canister";

class TokenService {
  constructor() {}

  async plugWalletRequestTransfer(args: PlugWalletRequestTransferParams) {
    try {
      const whitelist = [
        process.env.CANISTER_ID_NEUROVERSE_STUDIO_BACKEND!,
        process.env.CANISTER_ID_ICRC1_LEDGER_CANISTER!,
        process.env.CANISTER_ID_ICP_LEDGER_CANISTER!,
      ];
      const host =
        process.env.DFX_NETWORK === "local"
          ? "http://127.0.0.1:4943"
          : "https://icp-api.io";

      //try to connect to plug wallet first
      const hasAllowed = await window.ic?.plug?.requestConnect({
        whitelist,
        host,
      });

      if (hasAllowed) {
        try {
          const actor = await window.ic.plug.createActor({
            canisterId: args.canisterId,
            interfaceFactory: idlFactory,
          });
          const transferArgs = {
            to: { owner: args.to, subaccount: [] },
            amount: args.amount,
            fee: args.fee,
            memo: null,
            from_subaccount: null,
            created_at_time: null,
          };
          const response = await actor.icrc1_transfer(transferArgs);
          return response;
        } catch (error) {
          if (typeof error !== "string") {
            toast.error("Transfer error", {
              description: `Plug wallet failed to transfer: ${error.message}`,
            });
          }

          toast.error("Transfer error", {
            description: `Plug wallet failed to transfer: ${error}`,
          });
          console.log(error);
          return null;
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
}

export default TokenService;
