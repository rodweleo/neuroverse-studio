import { Principal } from "@dfinity/principal";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import BigNumber from "bignumber.js";

export const getAccountIdFromPrincipal = (principal: Principal): string => {
  const accountId = AccountIdentifier.fromPrincipal({ principal }).toHex();
  return accountId;
};

export function formatTimestamp(timestamp: bigint): string {
  // Convert nanoseconds to milliseconds
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTokenAmount(rawAmount: bigint, decimals): number {
  return new BigNumber(rawAmount.toString())
    .dividedBy(new BigNumber(10).pow(decimals))
    .toNumber();
}
