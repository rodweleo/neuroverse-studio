import { toast } from "@/components/ui/sonner";
import { PlugWalletRequestTransferParams } from "@/utils/types";
import { idlFactory } from "../../../declarations/neuroverse-studio-backend";

class TokenService {
  constructor() {}

  async plugWalletRequestTransfer(args: PlugWalletRequestTransferParams) {
    try {
      const whitelist = [
        "umunu-kh777-77774-qaaca-cai",
        "u6s2n-gx777-77774-qaaba-cai",
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
            canisterId: args.opts.canisterId,
            interfaceFactory: idlFactory,
          });
          console.log(actor);
          const txReceipt = await window.ic?.plug?.requestTransfer(args);
          return txReceipt;
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
