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
import { PreviewTokenTransferModal } from "./transfer/PreviewTokenTransferModal";
import { ProcessingTokenTransferModal } from "./transfer/ProcessingTokenTransferModal";
import { TokenTransferSuccessModal } from "./transfer/TokenTransferSuccessModal";

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

  const tokenTransferSchema = z
    .object({
      token: z.object({
        name: z.string(),
        balance: z.any(),
        formattedBalance: z.number(),
        symbol: z.string(),
        transactionFee: z.string(),
      }),
      receipient: z.string({
        message: "Receipient Principal ID is required.",
      }),
      amount: z
        .number({ invalid_type_error: "Amount must be a number." })
        .positive("Amount must be greater than 0."),
      transactionFee: z.string().optional(),
    })
    .refine((data) => data.amount <= data.token.balance, {
      message: "Amount cannot exceed account balance.",
      path: ["amount"],
    });

  const tokenTransferForm = useForm<z.infer<typeof tokenTransferSchema>>({
    resolver: zodResolver(tokenTransferSchema),
    defaultValues: {
      token: tokens[0],
      receipient: "",
      amount: 0,
      transactionFee: tokens[0]?.transactionFee,
    },
  });

  const handleClose = () => {
    setRecipient("");
    setAmount("");
    setMemo("");
    setStatus("idle");
    setTxHash("");
    setError("");
    // onClose();
  };

  const selectedToken = tokenTransferForm.getValues()?.token;
  const transaction = {
    ...tokenTransferForm.getValues(),
    transactionFee: tokenTransferForm.getValues()?.token?.transactionFee,
    totalAmount: Number((
      Number(tokenTransferForm.getValues()?.token?.transactionFee) +
      Number(tokenTransferForm.getValues()?.amount)
    ).toFixed(4)),
  };

  function onSubmit(values: z.infer<typeof tokenTransferSchema>) {
    setStatus("preview");
    // console.log(values);
  }
  if (status === "preview") {
    return (
      <PreviewTokenTransferModal
        status={status}
        transaction={transaction}
        onStatusChange={setStatus}
      />
    );
  }
  if (status === "processing") {
    return (
      <ProcessingTokenTransferModal
        status={status}
        transaction={transaction}
        onStatusChange={setStatus}
      />
    );
  }

  if (status === "success") {
    return (
      <TokenTransferSuccessModal
        status={status}
        transaction={transaction}
        onStatusChange={setStatus}
        form={tokenTransferForm}
      />
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
                        defaultValue={0}
                        {...tokenTransferForm.register("amount", {
                          valueAsNumber: true,
                        })}
                        className="flex-1"
                        min="0"
                        step="0.00001"
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
                type="button"
              >
                Cancel
              </Button>
              <Button
                disabled={!tokenTransferForm.formState.isValid}
                className="flex-1"
              >
                Send
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
