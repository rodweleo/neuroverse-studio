import TokenLedgerCanister from "@/utils/TokenLedgerCanister";
import { BalanceParams, IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { useQuery } from "@tanstack/react-query";
import { Principal } from "@dfinity/principal";
import { Subaccount } from "@dfinity/ledger-icrc/dist/candid/icrc_ledger";
import { useNeuroTokenInfo } from "./use-neuro-token";
import { useAuth } from "@/contexts/use-auth-client";
import { createAgent } from "@dfinity/utils";

export type UseAccountTokensProps = {
  owner: Principal;
  subaccount?: Subaccount;
};

export const useAccountTokens = ({
  owner,
  subaccount,
}: UseAccountTokensProps) => {
  const { data } = useNeuroTokenInfo();
  const { identity, host } = useAuth();
  const canisterId = Principal.fromText(
    process.env.CANISTER_ID_ICRC1_LEDGER_CANISTER!
  );

  return useQuery({
    queryKey: ["neuroverse_account_tokens"],
    queryFn: async () => {
      const agent = await createAgent({ identity, host });
      if (process.env.DFX_NETWORK !== "ic") await agent.fetchRootKey();

      const icrcLedger = IcrcLedgerCanister.create({
        agent,
        canisterId,
      });
      const balanceParams: BalanceParams = {
        owner,
        subaccount,
      };
      const neuroBalance =
        (await icrcLedger.balance(balanceParams)) || BigInt(0);
      const tokens = [
        {
          name: "NEURO",
          balance: neuroBalance,
          formattedBalance: Number(neuroBalance) / 100000000,
          symbol: "$NEURO",
          transactionFee: data.formattedFee ?? 0,
        },
        {
          name: "ICP",
          balance: Number(BigInt(0)),
          formattedBalance: Number(BigInt(0)) / 100000000,
          symbol: "ICP",
          transactionFee: 0,
        },
      ];
      return tokens;
    },
    enabled: Boolean(identity && canisterId),
  });
};
