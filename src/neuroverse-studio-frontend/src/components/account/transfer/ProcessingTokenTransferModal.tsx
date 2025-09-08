import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "lucide-react";

export const ProcessingTokenTransferModal = ({
  status,
  transaction,
  onStatusChange,
}) => {
  setTimeout(() => {
    onStatusChange("success");
  }, 5000);
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
