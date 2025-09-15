import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Coins,
  User,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tool } from "../../../../declarations/neuroverse-studio-backend/neuroverse-studio-backend.did";
import { formatPrincipal, formatTokenAmount } from "@/utils";

interface DeployAgentPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  selectedTools: Tool[];
  tokenSymbol: string;
  agentName: string;
  platformFeePercentage?: number;
  currentBalance: number;
  isFirstTimeDeployer: boolean;
  welcomeBonus?: number;
}

const DeployAgentPaymentModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedTools,
  tokenSymbol,
  agentName,
  platformFeePercentage = 10,
  currentBalance,
  isFirstTimeDeployer,
  welcomeBonus = 100,
}: DeployAgentPaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const totalToolCost = selectedTools.reduce(
    (sum, tool) => sum + Number(formatTokenAmount(tool.price, tool.decimals)),
    0
  );
  const platformFee = (totalToolCost * platformFeePercentage) / 100;
  const totalCost = totalToolCost + platformFee;

  const availableBalance = isFirstTimeDeployer
    ? currentBalance + welcomeBonus
    : currentBalance;
  const finalBalance = availableBalance - totalCost;
  const hasInsufficientFunds = finalBalance < 0;

  const handleConfirm = async () => {
    if (hasInsufficientFunds) return;

    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Deployment failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTokens = (amount: number) => {
    return `${amount.toLocaleString()} ${tokenSymbol}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl bg-black/90 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isFirstTimeDeployer
              ? "Welcome Bonus + Premium Tools"
              : "Premium Tool Payment"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {isFirstTimeDeployer
              ? `Welcome! You'll receive ${welcomeBonus} ${tokenSymbol} tokens for your first deployment. Premium tool costs will be deducted.`
              : `Premium tool costs will be deducted from your current balance.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Tools */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Premium Tools ({selectedTools.length})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedTools.map((tool, idx) => (
                <div
                  key={`tool-${idx}`}
                  className="flex items-center justify-between p-2 bg-black/20 rounded border border-white/10"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{tool.name}</p>
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="size-[12.5px] mt-[2px]" />
                        <span>{formatPrincipal(tool.creator)}</span>
                      </div>

                      <Badge variant="outline" className="text-xs max-w-sm">
                        <p className="font-bold text-neon-blue">
                          {formatTokenAmount(tool.price, tool.decimals)}{" "}
                          {tool.currency}
                        </p>
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Token Balance Calculation */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {isFirstTimeDeployer
                ? "Welcome Bonus Calculation"
                : "Payment Breakdown"}
            </h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Current Balance</span>
                <span>{formatTokens(currentBalance)}</span>
              </div>

              {isFirstTimeDeployer && (
                <div className="flex justify-between font-bold text-acid-green">
                  <span>Welcome Bonus</span>
                  <span>+{formatTokens(welcomeBonus)}</span>
                </div>
              )}

              <div className="flex justify-between text-red-400">
                <span>Tool Costs</span>
                <span>-{formatTokens(totalToolCost)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Platform Fee ({platformFeePercentage}%)</span>
                <span>-{formatTokens(platformFee)}</span>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex justify-between font-bold text-neon-purple">
                <span>Final Balance</span>
                <span>{formatTokens(Math.max(0, finalBalance))}</span>
              </div>
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Payment Distribution */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Payment Distribution
            </h4>
            <div className="text-sm text-muted-foreground">
              Tool creators will receive their payments directly when you deploy
              this agent.
            </div>
          </div>

          {/* Warning for insufficient funds */}
          {hasInsufficientFunds && (
            <Alert className="border-red-500/20 bg-red-500/10">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                {isFirstTimeDeployer
                  ? `Tool costs exceed your welcome bonus! You need ${formatTokens(
                      Math.abs(finalBalance)
                    )} more ${tokenSymbol} tokens.`
                  : `Insufficient balance! You need ${formatTokens(
                      Math.abs(finalBalance)
                    )} more ${tokenSymbol} tokens.`}
              </AlertDescription>
            </Alert>
          )}

          {/* Success message */}
          {!hasInsufficientFunds && (
            <Alert className="border-acid-green/50 bg-acid-green/10  ">
              <AlertDescription className="text-acid-green">
                {isFirstTimeDeployer
                  ? `Welcome to the platform! After deployment, you'll have ${formatTokens(
                      finalBalance
                    )} tokens remaining.`
                  : `Ready to deploy! You'll have ${formatTokens(
                      finalBalance
                    )} tokens remaining after payment.`}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-white/20"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={hasInsufficientFunds || isProcessing}
            className="flex-1 bg-neon-purple/80 hover:bg-neon-purple text-white disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deploying...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {isFirstTimeDeployer ? "Deploy First Agent" : "Deploy Agent"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeployAgentPaymentModal;
