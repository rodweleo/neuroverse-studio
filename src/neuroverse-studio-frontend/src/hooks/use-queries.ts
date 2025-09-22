import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/use-auth-client";
import { formatTokenAmount, toRawTokenAmount } from "@/utils";
import NeuroverseBackendActor from "@/utils/NeuroverseBackendActor";
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNeuroTokenInfo } from "./use-neuro-token";
import { queryClient } from "@/components/providers";
import { CreateAgentResponse } from "../../../declarations/neuroverse-studio-backend/neuroverse-studio-backend.did";
import { createAgent } from "@dfinity/utils";
import { AccountToAccountIcrc1TokenTransfer } from "@/utils/types";

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

      queryClient.invalidateQueries({
        queryKey: ["neuroverse-agents"],
      });
      queryClient.invalidateQueries({
        queryKey: ["is-user-subscribed-to-agent"],
      });
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

export function useUserDeleteAgent() {
  return useMutation({
    mutationFn: async ({ agentId }: { agentId: string }) => {
      const deleteAgentResponse = await NeuroverseBackendActor.deleteAgent(
        agentId
      );
      return deleteAgentResponse;
    },
    onSuccess: () => {
      toast.success("Agent deleted successfully!");

      queryClient.invalidateQueries({
        queryKey: ["neuroverse-agents"],
      });
      queryClient.invalidateQueries({
        queryKey: ["neuroverse-user-agents"],
      });
    },
    onError: (error: Error) => {
      toast.error("Error while deleting agent!", {
        description: error.message,
      });
    },
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
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 20,
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
          return tx.to
            .toString()
            .includes(principal.toString() || user?.toString());
        })
        .reduce((sum, tx) => {
          return (
            sum + Number(formatTokenAmount(tx.amount, neuroTokenInfo?.decimals))
          );
        }, 0);

      const totalSpendings = transactions
        .filter((tx) => {
          return tx.from
            .toString()
            .includes(principal.toString() || user?.toString());
        })
        .reduce((sum, tx) => {
          return (
            sum + Number(formatTokenAmount(tx.amount, neuroTokenInfo?.decimals))
          );
        }, 0);

      return {
        transactions,
        totalDeposits,
        totalSpendings,
      };
    },
    enabled: !!principal || !!user,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 20,
  });
}

/**
 * TOOL QUERIES
 */

export function useUserDeleteTool() {
  return useMutation({
    mutationFn: async ({ toolId }: { toolId: string }) => {
      const deleteToolResponse = await NeuroverseBackendActor.deleteTool(
        toolId
      );
      return deleteToolResponse;
    },
    onSuccess: () => {
      toast.success("Tool deleted successfully!");

      queryClient.invalidateQueries({
        queryKey: ["neuroverse-tools"],
      });
    },
    onError: (error: Error) => {
      toast.error("Error while deleting tool!", {
        description: error.message,
      });
    },
  });
}

export function useUserTokenTransfer() {
  const { agent, principal: from } = useAuth();

  return useMutation({
    mutationFn: async ({
      amount,
      to,
    }: {
      amount: number;
      to: string | Principal;
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
        amount: BigInt(Math.floor(amount * 10 ** 8)),
        // fee, memo, created_at_time can be added as needed
      });

      return blockIndex;
    },
    onSuccess: () => {
      toast.success(`Token transfer was successfully to ${from.toString()}!`);

      queryClient.invalidateQueries({
        queryKey: ["neuroverse_account_tokens"],
      });
    },
    onError: (error: Error) => {
      toast.error("Error processing transaction: ", {
        description: error.message,
      });
    },
  });
}

export function useAccountToAccountIcrc1TokenTransfer() {
  const { identity } = useAuth();
  return useMutation({
    mutationFn: async (
      accountToAccountIcrc1TokenTransferArgs: AccountToAccountIcrc1TokenTransfer
    ): Promise<bigint> => {
      console.log(accountToAccountIcrc1TokenTransferArgs);
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

      const transferResult = await ledger.transfer({
        to: {
          owner: accountToAccountIcrc1TokenTransferArgs.to,
          subaccount: [],
        },
        amount:
          typeof accountToAccountIcrc1TokenTransferArgs.amount === "bigint"
            ? accountToAccountIcrc1TokenTransferArgs.amount
            : BigInt(accountToAccountIcrc1TokenTransferArgs.amount), // amount in smallest unit
        created_at_time: BigInt(Date.now()) * BigInt(1e6),
        // fee, memo, can be added as needed
      });

      return transferResult;
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({
        queryKey: ["neuroverse-agents"],
      });
    },
    onError: (error: Error) => {
      console.log(error);
      toast.error("Error deploying agent: ", {
        description: error.message,
      });
    },
  });
}

export function useDeployAgent() {
  const { agent, principal: from } = useAuth();
  const a2aIcrc1TokenTransferMutation = useAccountToAccountIcrc1TokenTransfer();
  return useMutation({
    mutationFn: async (createAgentArgs: any) => {
      if (!agent) throw new Error("HTTP Agent is not available");

      const args = {
        ...createAgentArgs,
        tools: createAgentArgs.tools.map((t: any) => t.id.toString()),
      };
      const response = await NeuroverseBackendActor.createAgent(args);

      if ("success" in response) {
        // filter out the premium tools
        const premiumTools = createAgentArgs.tools.filter(
          (t) => Number(t.price) > 0
        );
        if (premiumTools.length > 0) {
          const results = [];
          for (const tool of premiumTools) {
            const res = await a2aIcrc1TokenTransferMutation.mutateAsync({
              from,
              to: tool.creator,
              amount: BigInt(toRawTokenAmount(tool.price, tool.decimals)),
            });
            results.push(res);
            await new Promise((r) => setTimeout(r, 200));
          }
          console.log("All tool creator payouts done safely:", results);
        }

        toast.success("Agent deployed cuccessfully!", {
          description: response.success.message,
        });
      } else if ("failed" in response) {
        toast.error("Failed to deploy agent!", {
          description: response.failed.message,
        });
      }

      return response;
    },
    onSuccess: (data: CreateAgentResponse) => {
      if ("success" in data) {
        toast.success(`Agent deployed successfully!`, {
          description: data.success.message,
        });

        queryClient.invalidateQueries({
          queryKey: ["neuroverse-agents"],
        });
      }
    },
    onError: (error: Error) => {
      toast.error("Error deploying agent: ", {
        description: error.message,
      });
    },
  });
}
