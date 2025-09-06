import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Send, CheckCircle, AlertTriangle, Copy } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { TokenTransferStatus } from "@/utils/types";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface TokenTransferModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  tokens: any[];
  fromAccount: string;
}

export const TokenTransferModal = ({
  isOpen,
  onClose,
  tokens,
  fromAccount,
}: TokenTransferModalProps) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [status, setStatus] = useState<TokenTransferStatus>("idle");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  const tokenTransferSchema = z.object({
    token: z.object({
      name: z.string(),
      balance: z.any(),
      formattedBalance: z.number(),
      symbol: z.string(),
    }),
    receipient: z.string(),
    amount: z.string(),
  });

  const tokenTransferForm = useForm<z.infer<typeof tokenTransferSchema>>({
    resolver: zodResolver(tokenTransferSchema),
    defaultValues: {
      token: tokens[0],
      receipient: "",
      amount: "0.00",
    },
  });

  const validatePrincipal = (principal: string): boolean => {
    // Basic validation for Principal ID format
    const principalRegex = /^[a-z0-9-]+$/;
    return principal.length > 10 && principalRegex.test(principal);
  };

  const handleTransfer = async () => {
    setError("");

    // Validation
    if (!selectedToken) {
      setError("Please select a token");
      return;
    }
    if (!recipient) {
      setError("Please enter recipient address");
      return;
    }
    if (!validatePrincipal(recipient)) {
      setError("Invalid Principal ID format");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (
      selectedToken &&
      parseFloat(amount) > parseFloat(selectedToken.formattedBalance.toString())
    ) {
      toast.error("Insufficient Funds", {
        description: "Amount exceeds available balance",
      });

      return;
    }

    setStatus("loading");

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate success
      const mockTxHash = "0x" + Math.random().toString(16).substring(2, 18);
      setTxHash(mockTxHash);
      setStatus("success");

      toast("Transfer Successful", {
        description: `Successfully sent ${amount} ${selectedToken} to ${recipient.substring(
          0,
          10
        )}...`,
      });
    } catch (err) {
      setStatus("error");
      setError("Transfer failed. Please try again.");
    }
  };

  const handleClose = () => {
    setRecipient("");
    setAmount("");
    setMemo("");
    setStatus("idle");
    setTxHash("");
    setError("");
    onClose();
  };

  const copyTxHash = () => {
    navigator.clipboard.writeText(txHash);
    toast("Copied!", {
      description: "Transaction hash copied to clipboard",
    });
  };

  const selectedToken = tokenTransferForm.getValues()?.token;

  const isFormValid =
    selectedToken &&
    recipient &&
    amount &&
    validatePrincipal(recipient) &&
    parseFloat(amount) > 0;

  function onSubmit(values: z.infer<typeof tokenTransferSchema>) {
    console.log(values);
  }

  if (status === "success") {
    return (
      <Dialog>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />
              Transfer Successful
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="text-2xl font-bold text-foreground mb-2">
                {amount} {selectedToken.symbol}
              </div>
              <div className="text-sm text-muted-foreground">
                Sent to {recipient.substring(0, 10)}...
                {recipient.substring(recipient.length - 6)}
              </div>
            </div>

            <div className="bg-secondary p-4 rounded-lg">
              <Label className="text-sm font-medium">Transaction Hash</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs font-mono bg-background px-2 py-1 rounded flex-1">
                  {txHash}
                </code>
                <Button size="icon" variant="ghost" onClick={copyTxHash}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="default"
                onClick={handleClose}
                className="flex-1"
              >
                New Transfer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger>Transfer</DialogTrigger>
      <DialogContent className="w-full min-w-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Transfer Tokens
          </DialogTitle>
          <DialogDescription>
            Send tokens to another Principal ID on the Internet Computer
            Protocol
          </DialogDescription>
        </DialogHeader>

        <Form {...tokenTransferForm}>
          <form
            onSubmit={tokenTransferForm.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <div className="space-y-4">
              <FormField
                control={tokenTransferForm.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Token</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value?.symbol}
                        onValueChange={(symbol) => {
                          const selected = tokens.find(
                            (t) => t.symbol === symbol
                          );
                          field.onChange(selected);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a token to send" />
                        </SelectTrigger>
                        <SelectContent>
                          {tokens.map((token) => (
                            <SelectItem key={token.symbol} value={token.symbol}>
                              <div className="flex items-center justify-between w-full">
                                <span>
                                  {token.name} ({token.symbol})
                                </span>
                                <span className="text-muted-foreground ml-2">
                                  {token.formattedBalance}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={tokenTransferForm.control}
                name="receipient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Account (Principal ID)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter recipient Principal ID"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={tokenTransferForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        className="flex-1"
                        min="0"
                        step="any"
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      {tokenTransferForm.getValues()?.token && (
                        <p className="text-sm text-muted-foreground">
                          Available: {selectedToken.formattedBalance}{" "}
                          {selectedToken.symbol}
                        </p>
                      )}
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
            <Alert className="bg-yellow-800 flex items-center gap-12">
              <AlertTriangle className="size-10" />
              <AlertDescription className="ml-6 mt-1">
                Always double-check the recipient Principal ID. Token transfers
                cannot be reversed.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={status === "loading"}
                type="button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTransfer}
                disabled={!isFormValid || status === "loading"}
                className="flex-1"
              >
                {status === "loading" && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                {status === "loading"
                  ? "Processing..."
                  : `Send ${tokenTransferForm.getValues()?.token?.symbol}`}
              </Button>
            </div>
          </form>
        </Form>
        <div className="space-y-6">
          {/* Amount */}

          {/* Security Warning */}

          {/* Transaction Preview */}
          {isFormValid && (
            <div className="bg-secondary p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Transaction Summary</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span>
                    {amount} {selectedToken.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-mono">
                    {recipient.substring(0, 8)}...
                    {recipient.substring(recipient.length - 4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Fee:</span>
                  <span>~0.0001 {selectedToken.symbol}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
        </div>
      </DialogContent>
    </Dialog>
  );
};
