import { useState } from "react";
import { Settings } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Bot, Network, Shield, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SettingsPageProps {
  settings: Settings | null;
  onRefresh: () => void;
}

export default function SettingsPage({ settings, onRefresh }: SettingsPageProps) {
  const [formData, setFormData] = useState<Partial<Settings>>(settings || {});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Failed to save settings");
      toast.success("Настройки сохранены");
      onRefresh();
    } catch (err) {
      toast.error("Ошибка при сохранении");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Настройки приложения</h2>
          <p className="text-muted-foreground">Управляйте провайдерами AI и параметрами системы.</p>
        </div>

        <div className="grid gap-6">
          <Card className="border">
            <CardHeader>
              <div className="flex items-center gap-2 mb-1 text-primary">
                <Bot className="w-4 h-4" />
                <CardTitle className="text-lg">AI Провайдер</CardTitle>
              </div>
              <CardDescription>Выберите LLM для анализа мыслей и декомпозиции задач.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Провайдер</Label>
                <Select 
                  value={formData.aiProvider} 
                  onValueChange={(val) => setFormData(p => ({ ...p, aiProvider: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите сервис" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Google Gemini (по умолчанию)</SelectItem>
                    <SelectItem value="lmstudio">LM Studio (локально)</SelectItem>
                    <SelectItem value="openrouter">OpenRouter</SelectItem>
                    <SelectItem value="custom">Свой эндпоинт</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.aiProvider !== "gemini" && (
                <div className="space-y-2 animate-in zoom-in-95 duration-200">
                  <Label>Base URL</Label>
                  <Input 
                    placeholder="http://localhost:1234/v1" 
                    value={formData.baseUrl || ""}
                    onChange={(e) => setFormData(p => ({ ...p, baseUrl: e.target.value }))}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Название модели</Label>
                  <Input 
                    placeholder="gemini-3-flash-preview" 
                    value={formData.modelName || ""}
                    onChange={(e) => setFormData(p => ({ ...p, modelName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input 
                    type="password"
                    placeholder={formData.aiProvider === 'gemini' ? "Используется системный ключ" : "Ваш ключ"} 
                    value={formData.apiKey || ""}
                    onChange={(e) => setFormData(p => ({ ...p, apiKey: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-1 text-primary">
                <Shield className="w-4 h-4" />
                <CardTitle className="text-lg">Безопасность и навыки (MCP)</CardTitle>
              </div>
              <CardDescription>Управление системными плагинами и доступом к инструментам.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20 opacity-60">
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Local MCP Server</div>
                    <div className="text-[11px] text-muted-foreground">В разработке</div>
                  </div>
                </div>
                <Badge variant="outline">OFF</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20 opacity-60">
                <div className="flex items-center gap-3">
                  <Network className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Shell Execution Skill</div>
                    <div className="text-[11px] text-muted-foreground">Безопасный режим</div>
                  </div>
                </div>
                <Badge variant="outline">OFF</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setFormData(settings || {})}>Отмена</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
