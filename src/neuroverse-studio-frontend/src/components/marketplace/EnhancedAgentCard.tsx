import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ChatModal from "@/components/chat/ChatModal";
import AgentPreview from "./AgentPreview";
import { Agent } from "../../../../declarations/neuroverse-studio-backend/neuroverse-studio-backend.did";
import { Badge } from "@/components/ui/badge";
import PayWithPlugWalletBtn from "@/components/transactions/PayWithPlugWalletBtn";
import { PlugWalletRequestTransferParams } from "@/utils/types";
import { useAuth } from "@/contexts/use-auth-client";
import { getAccountIdFromPrincipal } from "@/utils";

interface EnhancedAgentCardProps {
  agent: Agent;
}

const EnhancedAgentCard = ({ agent }: EnhancedAgentCardProps) => {
  const { principal: fallbackPrincipal } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toast } = useToast();

  const { isFree, created_by, price } = agent;

  const accountId = getAccountIdFromPrincipal(
    created_by ? created_by : fallbackPrincipal
  );

  const transferArgs: PlugWalletRequestTransferParams = {
    to: created_by,
    from: fallbackPrincipal,
    amount: BigInt(Number(price) * 100000000),
    canisterId: process.env.CANISTER_ID_ICRC1_LEDGER_CANISTER!,
    from_subaccount: null,
    fee: BigInt(10000),
  };

  // const handleShare = async () => {
  //   if (navigator.share) {
  //     try {
  //       await navigator.share({
  //         title: `${agent.name} - NeuroVerse Agent`,
  //         text: agent.description,
  //         url: window.location.href
  //       });
  //     } catch (error) {
  //       // User cancelled sharing
  //     }
  //   } else {
  //     navigator.clipboard.writeText(window.location.href);
  //     toast({
  //       title: "Link Copied",
  //       description: "Agent link has been copied to your clipboard.",
  //     });
  //   }
  // };

  const handleStartChat = () => {
    setIsPreviewOpen(false);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="relative group p-1 rounded-lg bg-gradient-to-b from-neon-blue/50 via-neon-purple/50 to-acid-green/50 border-none w-full">
        <div className="h-full w-full p-6 rounded-md glassmorphic bg-base-black flex flex-col space-y-4 transition-transform duration-300 group-hover:-translate-y-1 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="text-xl font-orbitron font-bold">
                  {agent.name}
                </h3>
                <p className={`text-sm font-bold`}>{agent.category}</p>
              </div>
            </div>

            {agent.isFree ? (
              <Badge>FREE</Badge>
            ) : (
              <div className="flex items-center gap-2 *:text-sm">
                <h3>Price:</h3>
                <Badge>{agent.price?.toString()} ICP</Badge>
              </div>
            )}
          </div>

          <p className="text-muted-foreground flex-grow text-sm leading-relaxed">
            {agent.description}
          </p>

          <div className="flex items-center gap-2 text-sm">
            <h3>Created by:</h3>
            <p>{agent.created_by?.toString()}</p>
          </div>
          {/* Action Buttons */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full">
            <Button
              variant="outline"
              onClick={() => setIsPreviewOpen(true)}
              className="w-full border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10"
            >
              <Eye className="h-4 w-4" />
              Preview Agent
            </Button>

            <Button
              onClick={() => setIsModalOpen(true)}
              className={`w-full font-bold bg-opacity-80 hover:bg-opacity-100 transition-all duration-200`}
            >
              Start Conversation <ArrowRight className="h-4 w-4" />
            </Button>

            {!isFree && (
              <PayWithPlugWalletBtn
                className="w-full"
                transferArgs={transferArgs}
              />
            )}
          </div>
        </div>
      </div>

      <AgentPreview
        agent={agent}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onStartChat={handleStartChat}
      />

      <ChatModal
        agent={agent}
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
      />
    </>
  );
};

export default EnhancedAgentCard;
