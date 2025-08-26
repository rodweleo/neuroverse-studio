import TransactionType "../types/transaction.type";
import Principal "mo:base/Principal";
import Array "mo:base/Array";

module TransactionModule {

  public func filterUserTransactions(
    txs : [TransactionType.Transaction],
    user : Principal,
  ) : [TransactionType.Transaction] {
    Array.filter<TransactionType.Transaction>(txs, func(tx) { tx.from == user or tx.to == user });
  };
};
