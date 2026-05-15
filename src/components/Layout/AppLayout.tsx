import { ReactNode } from "react";
import { Network, LayoutGrid, Settings as SettingsIcon, MessageSquare } from "lucide-react";
import ChatPanel from "@/components/Chat/ChatPanel";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: ReactNode;
  activeTab: "mindmap" | "kanban" | "settings";
  setActiveTab: (tab: "mindmap" | "kanban" | "settings") => void;
  onRefreshTasks: () => void;
}

export default function AppLayout({ children, activeTab, setActiveTab, onRefreshTasks }: AppLayoutProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Navigation Bar */}
      <nav className="h-14 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-600/20">M</div>
          <h1 className="text-lg font-semibold tracking-tight">MindTask AI <span className="text-muted-foreground text-xs font-normal ml-2">v1.0.4</span></h1>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>AI: Online</span>
          </div>
          <div className="h-8 w-[1px] bg-border"></div>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveTab("settings")}>
            Настройки
          </Button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Navigation */}
        <aside className="w-16 border-r border-border flex flex-col items-center py-6 gap-8 bg-card/30">
          <Button
            variant="ghost"
            size="icon"
            className={`p-2 transition-colors ${activeTab === "mindmap" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setActiveTab("mindmap")}
            title="Интеллект-карта"
          >
            <Network className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`p-2 transition-colors ${activeTab === "kanban" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setActiveTab("kanban")}
            title="Канбан-доска"
          >
            <LayoutGrid className="w-6 h-6" />
          </Button>
          <div className="mt-auto space-y-4">
            <Button
              variant="ghost"
              size="icon"
              className={`p-2 transition-colors ${activeTab === "settings" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab("settings")}
              title="Настройки"
            >
              <SettingsIcon className="w-6 h-6" />
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative overflow-hidden flex flex-col bg-[radial-gradient(#27272a_1px,transparent_1px)] bg-[size:24px_24px]">
          <div className="flex-1 overflow-hidden flex flex-col">
            {children}
          </div>
        </main>

        {/* Right Sidebar - AI Chat */}
        <aside className="w-80 border-l border-border bg-card flex flex-col">
          <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card/50">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" /> 
              Чат-ассистент
            </h2>
            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">Active</Badge>
          </header>
          <ChatPanel onRefreshTasks={onRefreshTasks} />
        </aside>
      </div>
    </div>
  );
}
