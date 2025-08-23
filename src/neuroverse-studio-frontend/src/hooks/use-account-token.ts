import TokenLedgerCanister from "@/utils/TokenLedgerCanister";
import { BalanceParams } from "@dfinity/ledger-icrc";
import { useQuery } from "@tanstack/react-query";
import type { Principal } from "@dfinity/principal";
import { Subaccount } from "@dfinity/ledger-icrc/dist/candid/icrc_ledger";

export type UseAccountTokensProps = {
  owner: Principal;
  subaccount?: Subaccount;
};

export const useAccountTokens = ({
  owner,
  subaccount,
}: UseAccountTokensProps) => {
  return useQuery({
    queryKey: ["neuroverse_account_tokens"],
    queryFn: async () => {
      const tokenLedgerCanister = new TokenLedgerCanister();
      const icrcLedger = await tokenLedgerCanister.initIcrcLedger();
      const balanceParams: BalanceParams = {
        owner,
        subaccount,
      };
      const neuroBalance = await icrcLedger.balance(balanceParams) || BigInt(0);
      const tokens = [
        {
          name: "NEURO",
          balance: neuroBalance,
          formattedBalance: Number(neuroBalance) / 100000000,
          symbol: "NEURO",
        },
        {
          name: "ICP",
          balance: Number(BigInt(0)),
          formattedBalance: Number(BigInt(0)) / 100000000,
          symbol: "ICP",
        },
      ];
      return tokens;
    },
  });
};
