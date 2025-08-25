import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import TokenService from "@/services/TokenService";
import { toast } from "@/components/ui/sonner";
import { PlugWalletRequestTransferParams } from "@/utils/types";
import { useAuth } from "@/contexts/use-auth-client";
import { TransferArgs } from "@dfinity/ledger-icp/dist/candid/ledger";

interface SubscribeToAgentBtnProps {
  className?: string;
  label?: string;
  transferArgs?: TransferArgs;
}

export default function PayWithPlugWalletBtn(props: SubscribeToAgentBtnProps) {
  const { agent } = useAuth();
  const { label, className, transferArgs } = props;

  const handleSubscription = async () => {};

  return (
    <Button
      type="button"
      className={cn(
        "bg-neon-purple/80 text-white hover:bg-neon-purple font-bold",
        className
      )}
      onClick={handleSubscription}
      disabled={!agent}
    >
      {label ? label : "Subscribe"}
    </Button>
  );
}
