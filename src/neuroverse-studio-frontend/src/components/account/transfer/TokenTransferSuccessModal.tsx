import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { toast } from "@/components/ui/sonner";

export const TokenTransferSuccessModal = ({
  status,
  transaction,
  onStatusChange,
  form,
}) => {
  const copyTxHash = () => {
    navigator.clipboard.writeText("");
    toast.success("Copied!", {
      description: "Transaction hash copied to clipboard",
    });
  };

  const handleCloseModal = () => {
    form.reset();
    onStatusChange("idle");
  };
  return (
    <Dialog open={status === "success"}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="text-center">
          <DialogTitle>Transfer Successful</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid place-items-center text-center gap-4">
            <div className="bg-green-500 w-fit rounded-full p-2">
              <Check className="text-black" size={80} />
            </div>
            <p>
              You have sent{" "}
              <span className="font-bold">
                {transaction?.amount} {transaction?.token?.symbol}
              </span>{" "}
              to <span className="font-bold">{transaction?.receipient}</span>
            </p>
          </div>
          <div className="space-y-2 hidden">
            <Label className="text-slate-300">Transaction Hash</Label>
            <div className="flex items-center justify-between border border-neon-purple/50 rounded-md p-2">
              <p>Hello world</p>
              <Button
                variant="ghost"
                className="bg-transparent text-neon-purple hover:bg-neon-purple/30"
                onClick={copyTxHash}
              >
                Copy
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              onClick={handleCloseModal}
              className="bg-neon-purple hover:bg-neon-purple/70 text-white"
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
