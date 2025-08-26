import React, { useState } from "react";
import { X, Bot, AlertTriangle } from "lucide-react";
import { Agent } from "../../../../../declarations/neuroverse-studio-backend/neuroverse-studio-backend.did";
import { useSubscribeToAgent } from "@/hooks/use-queries";

interface SubscriptionDialogProps {
  agent: Agent;
  onClose: () => void;
}

export default function SubscriptionDialog({
  agent,
  onClose,
}: SubscriptionDialogProps) {
  const [confirmed, setConfirmed] = useState(false);
  const subscribeToAgent = useSubscribeToAgent();

  const handleSubscribe = async () => {
    if (!confirmed && !agent.isFree) return;

    try {
      const result = await subscribeToAgent.mutateAsync({
        to: agent.created_by,
        amount: agent.price,
      });
      if (result) {
        onClose();
      } else {
        // Handle subscription failure
        console.error("Subscription failed");
      }
    } catch (error) {
      console.error("Subscription error:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Subscribe to {agent.name} agent
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Bot className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{agent.name}</h4>
              <p className="text-sm text-gray-600">{agent.description}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Subscription Cost:</span>
              <span className="font-semibold text-gray-900">
                {agent.isFree ? "Free" : `${agent.price.toString()} tokens`}
              </span>
            </div>
            {!agent.isFree && (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Network Fees:</span>
                  <span className="text-sm text-gray-900">~0.001 tokens</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total:</span>
                  <span className="font-semibold text-gray-900">
                    ~{(Number(agent.price) + 0.001).toFixed(3)} tokens
                  </span>
                </div>
              </>
            )}
          </div>

          {!agent.isFree && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-800 font-medium mb-1">
                    Payment Processing Notice
                  </p>
                  <p className="text-sm text-amber-700">
                    This will initiate a token transfer from your wallet to the
                    agent creator. The transaction cannot be reversed once
                    confirmed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!agent.isFree && (
            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="confirm"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="confirm" className="ml-2 text-sm text-gray-700">
                I understand and confirm this payment
              </label>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubscribe}
              disabled={
                (!agent.isFree && !confirmed) || subscribeToAgent.isPending
              }
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {subscribeToAgent.isPending
                ? "Processing..."
                : agent.isFree
                ? "Subscribe"
                : "Confirm & Pay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
