import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye } from "lucide-react";
import ChatModal from "@/components/chat/ChatModal";
import AgentPreview from "./AgentPreview";
import { Agent } from "../../../../declarations/neuroverse-studio-backend/neuroverse-studio-backend.did";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/use-auth-client";
import SubscriptionDialog from "../agent/subscription/SubscriptionDialog";
import { useIsUserSubscribedToAgent } from "@/hooks/use-queries";
import { useNeuroTokenInfo } from "@/hooks/use-neuro-token";
import { formatTokenAmount } from "@/utils";

interface EnhancedAgentCardProps {
  agent: Agent;
}

const EnhancedAgentCard = ({ agent }: EnhancedAgentCardProps) => {
  const { principal } = useAuth();
  const { data: isSubscribed, isLoading } = useIsUserSubscribedToAgent(
    principal,
    agent.id
  );
  const { data: neuroTokenInfo } = useNeuroTokenInfo();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { isFree, description, created_by, price } = agent;

  const canStartConversation =
    isSubscribed || isFree || created_by?.toString() === principal?.toString();

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

            {isSubscribed ? (
              <Badge className="text-green-500 bg-green-200/50 border-2 border-green-500 font-semibold">
                SUBSCRIBED
              </Badge>
            ) : agent.isFree ? (
              <Badge>FREE</Badge>
            ) : (
              <div className="flex items-center gap-2 *:text-sm">
                <h3>Price:</h3>
                <Badge>
                  {formatTokenAmount(price, neuroTokenInfo?.decimals)}{" "}
                  {neuroTokenInfo?.symbol}
                </Badge>
              </div>
            )}
          </div>

          <p className="text-muted-foreground flex-grow text-sm leading-relaxed">
            {description}
          </p>

          <div className="flex items-center gap-2 text-sm">
            <h3>Created by:</h3>
            <p>
              {created_by?.toString()} {""}
              {created_by === principal && "(ME)"}
            </p>
          </div>
          {/* Action Buttons */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full">
            {/* <Button
              variant="outline"
              onClick={() => setIsPreviewOpen(true)}
              className="w-full border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10"
            >
              <Eye className="h-4 w-4" />
              Preview Agent
            </Button> */}

            {canStartConversation ? (
              <Button
                onClick={() => setIsModalOpen(true)}
                className={`w-full font-bold bg-opacity-80 hover:bg-opacity-100 transition-all duration-200`}
              >
                Start Conversation <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <SubscriptionDialog agent={agent} />
            )}
          </div>
        </div>
      </div>

      {/* <AgentPreview
        agent={agent}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onStartChat={handleStartChat}
      /> */}

      <ChatModal
        agent={agent}
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
      />
    </>
  );
};

export default EnhancedAgentCard;
