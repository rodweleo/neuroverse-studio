import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useNeuroTokenInfo } from "@/hooks/use-neuro-token";

export const PreviewTokenTransferModal = ({
  status,
  transaction,
  onStatusChange,
}) => {
  const handleConfirmTokenTransfer = () => {
    onStatusChange("processing");
  };
  return (
    <Dialog
      open={status === "preview"}
      // onOpenChange={() => onStatusChange("idle")}
    >
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-success">
            Preview Transfer
          </DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <Label className="text-gray-400">Sending</Label>
            <p className="text-md">{`${transaction?.amount} ${transaction?.token?.symbol}`}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-gray-400">To</Label>
            <p className="text-md">{transaction?.receipient}</p>
          </div>
          <table className="w-full">
            <tr className="*:py-1 w-full">
              <td>
                <p className="text-gray-400 text-sm">Transaction Fee</p>
              </td>
              <td className="text-right">
                <p>
                  {transaction?.transactionFee} {transaction?.token?.symbol}
                </p>
              </td>
            </tr>
            <tr className="*:py-1 w-full">
              <td>
                <p className="text-gray-400 text-sm">Amount to Receive</p>
              </td>
              <td className="text-right">
                <p>
                  {transaction?.totalAmount} {transaction?.token?.symbol}
                </p>
              </td>
            </tr>
          </table>
        </div>
        <DialogFooter className="w-full">
          <div className="flex items-center justify-end w-full gap-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleConfirmTokenTransfer}>Confirm</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
