import {
  Zap,
  Workflow,
  Calculator,
  Cloud,
  FileText,
  Globe,
  Search,
  Code,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ToolCard from "@/components/tools/ToolCard";

import { DeveloperPortal } from "@/components/DeveloperPortal";
import { useAllTools } from "@/hooks/use-all-tools";

const ToolMarketplace = () => {
  const { data } = useAllTools();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTool, setSelectedTool] = useState(null);
  const [showDeveloperPortal, setShowDeveloperPortal] = useState(false);

  console.log(data);
  const filteredTools = data
    ? data.filter((tool) => {
        const matchesSearch =
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === "all" || tool.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    : [];

  return (
    <main className="container py-8 space-y-4">
      <header className="space-y-4 flex flex-wrap items-end justify-between h-60 bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 p-6 rounded-lg shadow-lg">
        <div className="space-y-2 w-full max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-orbitron font-bold holographic-text py-2">
            Tool Store
          </h1>
          <p className="text-md md:text-lg text-muted-foreground">
            Discover, integrate, and monetize AI tools that supercharge your
            agents. From APIs to utilities, build the perfect AI toolkit for any
            use case.
          </p>
        </div>
        <Button
          className="bg-neon-purple/80 hover:bg-neon-purple text-white hidden"
          asChild
          onClick={() => setShowDeveloperPortal(true)}
        >
          <Link to="#">
            <Workflow className="mr-2 h-4 w-4" />
            Launch your own tool
          </Link>
        </Button>
      </header>
      <div>
        <div className="py-8">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1 bg-gray-700 rounded-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="search"
                  placeholder="Search tools, categories, or creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-transparent text-white shadow-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onSelect={setSelectedTool}
                />
              ))}
            </div>

            {filteredTools.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No tools found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Tool Integration Modal
        {selectedTool && (
          <ToolIntegrationModal
            tool={selectedTool}
            onClose={() => setSelectedTool(null)}
          />
        )} */}

        {/* Developer Portal Modal */}
        {showDeveloperPortal && (
          <DeveloperPortal onClose={() => setShowDeveloperPortal(false)} />
        )}
      </div>
    </main>
  );
};

export default ToolMarketplace;
