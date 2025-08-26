import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/use-auth-client";
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { useMutation } from "@tanstack/react-query";

export function useSubscribeToAgent() {
  const { agent, principal: From } = useAuth();

  return useMutation({
    mutationFn: async ({
      to,
      amount,
    }: {
      to: Principal | string;
      amount: bigint;
    }) => {
      if (!agent) throw new Error("HTTP Agent is not available");

      const formattedTo = typeof to === "string" ? Principal.fromText(to) : to;

      const ledger = IcrcLedgerCanister.create({
        agent,
        canisterId: Principal.fromText(
          process.env.CANISTER_ID_ICRC1_LEDGER_CANISTER!
        ),
      });

      if (process.env.DFX_NETWORK === "local") {
        await agent.fetchRootKey();
      }

      const balance = await ledger.balance({
        owner: From,
        subaccount: null,
      });
      const receiverBalance = await ledger.balance({
        owner: formattedTo,
        subaccount: null,
      });
      console.log(`Sender original balance: ${balance}`);
      console.log(`Receiver's original balance: ${receiverBalance}`);

      const transferResult = await ledger.transfer({
        to: {
          owner: formattedTo,
          subaccount: [],
        },
        amount: amount, // amount in smallest unit
        // fee, memo, created_at_time can be added as needed
      });

      return transferResult;
    },
    onSuccess: () => {
      toast.success("Successfully subscribed!");
    },
    onError: (error: Error) => {
      toast.error("Error while subscribing!", {
        description: error.message,
      });
    },
  });
}
