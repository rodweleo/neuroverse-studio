import { Principal } from "@dfinity/principal";
import { AccountIdentifier } from "@dfinity/ledger-icp";

export const getAccountIdFromPrincipal = (principal: Principal): string => {
  const accountId = AccountIdentifier.fromPrincipal({ principal }).toHex();
  return accountId;
};
