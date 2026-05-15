import { useEffect, useState } from "react";
import AppLayout from "@/components/Layout/AppLayout";
import Mindmap from "@/components/Mindmap/Mindmap";
import Kanban from "@/components/Kanban/Kanban";
import SettingsPage from "@/components/Settings/SettingsPage";
import { Toaster } from "@/components/ui/sonner";
import { TaskNode, Settings } from "@/types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"mindmap" | "kanban" | "settings">("mindmap");
  const [tasks, setTasks] = useState<TaskNode[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchSettings();
  }, []);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <AppLayout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onRefreshTasks={fetchTasks}
      >
        {activeTab === "mindmap" && <Mindmap tasks={tasks} onRefresh={fetchTasks} />}
        {activeTab === "kanban" && <Kanban tasks={tasks} onRefresh={fetchTasks} />}
        {activeTab === "settings" && <SettingsPage settings={settings} onRefresh={fetchSettings} />}
      </AppLayout>
      <Toaster />
    </div>
  );
}
