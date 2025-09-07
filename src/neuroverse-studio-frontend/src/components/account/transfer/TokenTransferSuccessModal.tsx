import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const TokenTransferSuccessModal = () => {
  return (
    <Dialog>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-success">
            Transfer Successful
          </DialogTitle>
        </DialogHeader>
        <div>
          <div>
            <Label>Transaction Hash</Label>
            <Input type="text" disabled />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
