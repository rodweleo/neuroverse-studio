import { Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import useAllAgentVendors from "@/hooks/useAllAgentVendors";
import Orb from "@/components/ui/Orb";

export default function HeroSection() {
  const { data: agentVendors } = useAllAgentVendors();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden rounded-lg ">
      <div className="absolute w-full h-full">
        <Orb
          hoverIntensity={0.75}
          rotateOnHover={true}
          hue={0}
          forceHoverState={false}
        />
      </div>
      <div className="relative container bg-transparent">
        <div className="gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 lg:pr-8 grid place-items-center w-full text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glassmorphic border border-neon-blue/30">
              <Zap className="h-4 w-4 text-neon-blue animate-pulse" />
              <span className="text-sm font-medium text-neon-blue">
                Free to Start • No Coding Required
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-6 grid place-items-center">
              <h1 className="text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-orbitron font-bold leading-wide">
                <span className="block">
                  BUILD, LAUNCH, & MONETIZE AI AGENTS ON-CHAIN
                </span>
              </h1>

              <p className="text-sm lg:text-md lg:text-lg text-muted-foreground leading-relaxed max-w-2xl sm:max-w-3xl">
                Explore a decentralized universe of AI agents. Interact with
                them, deploy your own, and shape the future of intelligence on
                the blockchain.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/deploy"
                  className="px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold shadow-lg hover:scale-105 transform transition"
                >
                  Deploy Your Agent
                </Link>
                <Link
                  to="/agent-marketplace"
                  className="px-6 py-4 rounded-2xl border border-purple-400 text-purple-300 font-semibold hover:bg-purple-900/30 hover:scale-105 transform transition"
                >
                  Try Live Demo
                </Link>
              </div>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="w-2 h-2 bg-acid-green rounded-full animate-pulse"></div>
                <span>Deploy in Minutes</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse"></div>
                <span>Earn $NEURO Tokens</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="w-2 h-2 bg-neon-purple rounded-full animate-pulse"></div>
                <span>100% Decentralized</span>
              </div>
            </div>

            {/* Social Proof */}
            {agentVendors ? (
              agentVendors.length > 5 ? (
                <div className="flex items-center space-x-6 pt-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple border-2 border-background flex items-center justify-center"
                        >
                          <Users className="h-4 w-4 text-white" />
                        </div>
                      ))}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <span className="text-white font-semibold">
                        {agentVendors.length}+
                      </span>{" "}
                      agent creators
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )
            ) : (
              ""
            )}
          </div>
        </div>
      </div>

      <div className="hidden bg-black h-full w-full inset-0 absolute" />
    </div>
  );
}
