import { toast } from "@/components/ui/sonner";
import { PlugWalletRequestTransferParams } from "@/utils/types";
import { TransferArg } from "@dfinity/ledger-icrc/dist/candid/icrc_ledger";
import { idlFactory } from "../../../declarations/icrc1_ledger_canister";

class TokenService {
  constructor() {}

  async plugWalletRequestTransfer(args: PlugWalletRequestTransferParams) {
    try {
      const whitelist = [
        process.env.CANISTER_ID_NEUROVERSE_STUDIO_FRONTEND!,
        process.env.CANISTER_ID_NEUROVERSE_STUDIO_BACKEND!,
        process.env.CANISTER_ID_ICRC1_LEDGER_CANISTER!,
        process.env.CANISTER_ID_ICP_LEDGER_CANISTER!,
      ];
      const host =
        process.env.DFX_NETWORK === "local"
          ? "http://127.0.0.1:4943"
          : "https://icp-api.io";

      const onConnect = async () => {
        try {
          // console.log(window.ic?.plug);
          // if (process.env.DFX_NETWORK === "local" && window.ic?.plug.agent) {
          //   await window.ic.plug.agent.fetchRootKey();
          // }
          // console.log(agent);

          const actor = await window.ic?.plug.createActor({
            canisterId: args.canisterId,
            interfaceFactory: idlFactory,
          });
          // console.log(actor);
          const transferArgs: TransferArg = {
            to: {
              owner: args.to,
              subaccount: [],
            },
            amount: args.amount,
            fee: [args.fee],
            memo: [],
            from_subaccount: [],
            created_at_time: [],
          };
          const result = await actor.icrc1_transfer(transferArgs);
          return result;
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
      };

      await window.ic?.plug?.requestConnect({
        whitelist,
        host,
        timeout: 50000,
      });
      const result = await onConnect();
      return result;
      // const icrcLedger = IcrcLedgerCanister.create({
      //   agent,
      //   canisterId: Principal.fromText(args.canisterId),
      // });

      // const response = await icrcLedger.transfer({
      //   to: {
      //     owner: args.to,
      //     subaccount: [],
      //   },
      //   amount: args.amount,
      //   fee: args.fee,
      // });
      // return response;
    } catch (e) {
      console.log(e);
    }
  }
  async transferFrom() {}
}

export default TokenService;
