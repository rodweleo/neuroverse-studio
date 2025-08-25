import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import TokenService from "@/services/TokenService";
import { toast } from "@/components/ui/sonner";
import { PlugWalletRequestTransferParams } from "@/utils/types";
import { useAuth } from "@/contexts/use-auth-client";

interface PayWithPlugWalletBtnProps {
  className?: string;
  label?: string;
  transferArgs?: PlugWalletRequestTransferParams;
}

export default function PayWithPlugWalletBtn(props: PayWithPlugWalletBtnProps) {
  const { agent } = useAuth();
  const { label, className, transferArgs } = props;

  const handleTransfer = async () => {
    if (!window.ic?.plug) {
      toast.info("Plug Wallet not available", {
        description:
          "Please install the Plug extension to smoothly sign transactions.",
      });
      return;
    }

    if (!agent) {
      toast.info("Kindly sign in to enable seamless subscription");
    }

    if (!transferArgs) {
      return;
    }

    const tokenService = new TokenService();
    const res = await tokenService.plugWalletRequestTransfer(transferArgs);
    console.log(res);
  };

  return (
    <Button
      type="button"
      className={cn(
        "bg-neon-purple/80 text-white hover:bg-neon-purple font-bold",
        className
      )}
      onClick={handleTransfer}
      disabled={!agent}
    >
      {label ? label : "Subscribe Now"}
    </Button>
  );
}
