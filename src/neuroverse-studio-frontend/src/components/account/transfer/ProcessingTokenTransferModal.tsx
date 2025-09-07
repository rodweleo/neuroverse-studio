import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export const ProcessingTokenTransferModal = ({ status }) => {
  return (
    <Dialog open={status === "processing"}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-success">
            Processing Transfer
          </DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
