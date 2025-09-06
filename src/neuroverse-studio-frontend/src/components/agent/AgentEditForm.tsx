import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, FileText, Brain, Save, X } from "lucide-react";
import KnowledgeBaseManager from "./KnowledgeBaseManager";
import { Agent } from "../../../../declarations/neuroverse-studio-backend/neuroverse-studio-backend.did";

interface AgentEditFormProps {
  agent: Agent;
  onSave: (agent: Agent) => void;
  onCancel: () => void;
}

const AgentEditForm = ({ agent, onSave, onCancel }: AgentEditFormProps) => {
  const [formData, setFormData] = useState<Agent>(agent);

  const iconOptions = [
    { value: "Bot", label: "Bot" },
    { value: "Brain", label: "Brain" },
    { value: "Stethoscope", label: "Medical" },
    { value: "GraduationCap", label: "Education" },
    { value: "Palette", label: "Creative" },
    { value: "Code", label: "Technical" },
    { value: "Heart", label: "Support" },
  ];

  const colorOptions = [
    { value: "text-neon-blue", label: "Neon Blue", preview: "bg-neon-blue" },
    {
      value: "text-neon-purple",
      label: "Neon Purple",
      preview: "bg-neon-purple",
    },
    { value: "text-acid-green", label: "Acid Green", preview: "bg-acid-green" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glassmorphic">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Basic Settings
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="font-medium">
                Agent Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role" className="font-medium">
                Role/Category
              </Label>
              <Input
                id="edit-role"
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, role: e.target.value }))
                }
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description" className="font-medium">
              Description
            </Label>
            <Input
              id="edit-description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-systemPrompt" className="font-medium">
              System Prompt
            </Label>
            <Textarea
              id="edit-systemPrompt"
              value={formData.system_prompt}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  systemPrompt: e.target.value,
                }))
              }
              rows={6}
              className="bg-background/50"
            />
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-pricing" className="font-medium">
                Price (ICP)
              </Label>
              <Input
                id="edit-pricing"
                type="number"
                step="0.01"
                min="0"
                value={Number(formData.price)}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pricing: parseFloat(e.target.value) || 0,
                  }))
                }
                className="bg-background/50"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" className="bg-neon-blue hover:bg-neon-blue/80">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default AgentEditForm;
