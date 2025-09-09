import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUserTokenTransfer } from "@/hooks/use-queries";
import { Loader } from "lucide-react";
import { useEffect } from "react";

export const ProcessingTokenTransferModal = ({
  status,
  transaction,
  onStatusChange,
}) => {
  const userTransferTokenMutation = useUserTokenTransfer();

  useEffect(() => {
    if (transaction) {
      userTransferTokenMutation
        .mutateAsync({
          amount: transaction?.totalAmount,
          to: transaction?.receipient,
        })
        .then((res) => {
          console.log(res);
          onStatusChange("success");
          return;
        })
        .catch((e) => {
          console.log(e);
          onStatusChange("idle");
          return;
        });
    }
  }, [transaction]);

  return (
    <Dialog open={status === "processing"}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center text-center gap-2">
            Processing Transfer
          </DialogTitle>
        </DialogHeader>
        <div className="grid place-items-center gap-2 text-center">
          <Loader className="animate-spin" size={50} />
          <p className="">
            Processing{" "}
            <span className="underline font-bold">
              {transaction?.amount} {transaction?.token?.symbol}
            </span>{" "}
            transfer to{" "}
            <span className="underline font-bold">
              {transaction?.receipient}
            </span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
