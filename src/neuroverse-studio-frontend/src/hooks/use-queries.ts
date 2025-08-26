import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/use-auth-client";
import { formatTokenAmount } from "@/utils";
import NeuroverseBackendActor from "@/utils/NeuroverseBackendActor";
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNeuroTokenInfo } from "./use-neuro-token";

export function useSubscribeToAgent() {
  const { agent, principal: from } = useAuth();

  return useMutation({
    mutationFn: async ({
      to,
      amount,
      agentId,
    }: {
      to: Principal | string;
      amount: bigint;
      agentId: string;
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

      const blockIndex = await ledger.transfer({
        to: {
          owner: formattedTo,
          subaccount: [],
        },
        amount: amount, // amount in smallest unit
        // fee, memo, created_at_time can be added as needed
      });

      const transactionRes = await NeuroverseBackendActor.addTransaction({
        id: [],
        blockIndex,
        amount,
        from,
        to: formattedTo,
        agentId: [agentId],
        timestamp: [],
      });

      console.log("Transaction response: " + transactionRes);

      // after saving the transaction, save the record for subscribing to the agent
      const subscribeRes = await NeuroverseBackendActor.subscribeToAgent(
        agentId,
        from
      );

      return subscribeRes;
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

export function useUserAgentSubscriptions() {
  const { principal } = useAuth();

  return useQuery({
    queryKey: ["user-agent-subscriptions"],
    queryFn: async () => {
      const subscriptions = await NeuroverseBackendActor.getUserSubscriptions(
        principal
      );

      return subscriptions;
    },
    enabled: !!principal,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}

export function useAgentSubscriptions(agentId: string) {
  return useQuery({
    queryKey: ["agent-subscriptions"],
    queryFn: async () => {
      const subscriptions = await NeuroverseBackendActor.getAgentSubscriptions(
        agentId
      );

      return subscriptions;
    },
    enabled: !!agentId,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}

export function useIsUserSubscribedToAgent(userId: Principal, agentId: string) {
  return useQuery({
    queryKey: ["is-user-subscribed-to-agent"],
    queryFn: async () => {
      const isUserSubscribed =
        await NeuroverseBackendActor.isUserSubscribedToAgent(userId, agentId);

      return isUserSubscribed;
    },
    enabled: !!userId || !!agentId,
  });
}

export function useUserTransactions(user?: Principal) {
  const { principal } = useAuth();
  const { data: neuroTokenInfo } = useNeuroTokenInfo();

  return useQuery({
    queryKey: ["agent-subscriptions"],
    queryFn: async () => {
      const transactions = await NeuroverseBackendActor.getUserTransactions(
        user ? user : principal
      );

      // calculate the amount received as deposits to the user
      const totalDeposits = transactions
        .filter((tx) => {
          return tx.to === principal;
        })
        .reduce((sum, tx) => {
          return sum + formatTokenAmount(tx.amount, neuroTokenInfo?.decimals);
        }, 0);

      const totalSpendings = transactions
        .filter((tx) => {
          return tx.from === principal;
        })
        .reduce((sum, tx) => {
          return sum + formatTokenAmount(tx.amount, neuroTokenInfo?.decimals);
        }, 0);

      return {
        transactions,
        totalDeposits,
        totalSpendings,
      };
    },
    enabled: !!principal || !!user,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}
