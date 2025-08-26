import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import TokenService from "@/services/TokenService";
import { toast } from "@/components/ui/sonner";
import { PlugWalletRequestTransferParams } from "@/utils/types";
import { useAuth } from "@/contexts/use-auth-client";
import {
  BlockIndex,
  TransferArgs,
} from "@dfinity/ledger-icp/dist/candid/ledger";
import {
  ApproveParams,
  IcrcLedgerCanister,
  TransferFromParams,
} from "@dfinity/ledger-icrc";
import { createAgent } from "@dfinity/utils";
import { Principal } from "@dfinity/principal";
import { bigint } from "zod";
import { useSubscribeToAgent } from "@/hooks/use-queries";
import { useState } from "react";

interface SubscribeToAgentBtnProps {
  className?: string;
  label?: string;
  transferArgs?: TransferArgs;
}

export default function SubscriptionToAgentBtn(
  props: SubscribeToAgentBtnProps
) {
  const { identity, host, principal } = useAuth();
  const [wantsToSubscribe, setWantsToSubscribe] = useState(false);
  const subscribeToAgent = useSubscribeToAgent();
  const { label, className, transferArgs } = props;

  const handleSubscription = async () => {
    const agent = await createAgent({
      identity,
      host:
        process.env.DFX_NETWORK === "local"
          ? "http://127.0.0.1:4943"
          : "https://icp-api.io",
    });

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
      owner: principal,
      subaccount: null,
    });
    const receiverBalance = await ledger.balance({
      owner: Principal.fromText(
        "njbqc-fgutr-5e2e3-qwiiu-hncre-sel2l-3bxa6-q53ys-dwoo6-zfiqe-6qe"
      ),
      subaccount: null,
    });
    console.log(`Sender original balance: ${balance}`);
    console.log(`Receiver's original balance: ${receiverBalance}`);

    const transferResult = await ledger.transfer({
      to: {
        owner: Principal.fromText(
          "njbqc-fgutr-5e2e3-qwiiu-hncre-sel2l-3bxa6-q53ys-dwoo6-zfiqe-6qe"
        ),
        subaccount: [],
      },
      amount: 1000000n, // amount in smallest unit
      // fee, memo, created_at_time can be added as needed
    });

    console.log(transferResult);

    // console.log(`Sender's balance after sending: `);
    // console.log(`Receiver's balance after sending: ${balance}`);
    // const transferFromParams: TransferFromParams = {
    //   from: principal,
    //   to: principal,
    // };
    // const transferFromResultBlockIndex = await ledger.transferFrom(
    //   transferFromParams
    // );
  };

  return (
    <Button
      type="button"
      className={cn(
        "bg-neon-purple/80 text-white hover:bg-neon-purple font-bold",
        className
      )}
      onClick={handleSubscription}
      // disabled={!agent}
    >
      {label ? label : "Subscribe"}
    </Button>
  );
}
