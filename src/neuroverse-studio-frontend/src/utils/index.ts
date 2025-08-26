import { Principal } from "@dfinity/principal";
import { AccountIdentifier } from "@dfinity/ledger-icp";

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

export function formatTokenAmount(amount: bigint): string {
  return amount.toString();
}
