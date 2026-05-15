import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { prisma } from "./src/lib/prisma.ts";
import { AIProviderFactory } from "./src/services/aiService.ts";
import { cosineSimilarity } from "./src/lib/vector.ts";
import cors from "cors";

// Environment setup for Esbuild bundling
const isProd = process.env.NODE_ENV === "production";
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  // API Routes
  
  // Settings
  app.get("/api/settings", async (req, res) => {
    try {
      let settings = await prisma.settings.findUnique({ where: { id: "default" } });
      if (!settings) {
        settings = await prisma.settings.create({
          data: { id: "default", aiProvider: "gemini" }
        });
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const settings = await prisma.settings.upsert({
        where: { id: "default" },
        update: req.body,
        create: { id: "default", ...req.body }
      });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await prisma.taskNode.findMany({
        orderBy: { updatedAt: "desc" }
      });
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const task = await prisma.taskNode.create({
        data: req.body
      });
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const task = await prisma.taskNode.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      // Recursively handles deletion via Prisma schema Cascade
      await prisma.taskNode.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // AI Semantic routing and assistance
  app.post("/api/ai/chat", async (req, res) => {
    const { messages, context } = req.body;
    try {
      const settings = await prisma.settings.findUnique({ where: { id: "default" } });
      const ai = AIProviderFactory.create(settings || {});
      
      const response = await ai.chat(messages, { 
        jsonMode: req.body.jsonMode,
        modelName: settings?.modelName
      });
      
      res.json(response);
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message || "AI processing failed" });
    }
  });

  app.post("/api/ai/analyze", async (req, res) => {
    const { text } = req.body;
    try {
      const settings = await prisma.settings.findUnique({ where: { id: "default" } });
      const ai = AIProviderFactory.create(settings || {});
      
      // 1. Get embedding for the thought
      const embedding = await ai.embed(text, {});
      
      // 2. Fetch all nodes with embeddings
      const nodes = await prisma.taskNode.findMany({
        where: { embedding: { not: null } }
      });
      
      // 3. Find top matches
      const matches = nodes.map(node => ({
        ...node,
        similarity: cosineSimilarity(embedding, JSON.parse(node.embedding || "[]"))
      })).sort((a, b) => b.similarity - a.similarity).slice(0, 3);

      // 4. AI Decides where to attach
      const prompt = `
Анализируй мысль пользователя: "${text}"
Существующие узлы интеллект-карты:
${matches.map(m => `- [${m.id}] ${m.title}: ${m.description}`).join("\n")}

Реши:
1. К какому узлу лучше прикрепить эту мысль (attach) или создать новый корень (create)?
2. Обоснуй решение (reasoning).
3. Разбей на подзадачи (subtasks).

Ответь в JSON формате:
{
  "action": "attach" | "create",
  "confidence": 0-1,
  "targetBranchId": "ID лучшего узла или null",
  "reasoning": "почему выбран этот узел",
  "subtasks": ["подзадача 1", "подзадача 2"]
}
`;
      const aiDecision = await ai.chat([
        { role: "system", content: "Ты интеллектуальный менеджер задач. Отвечай строго в формате JSON на русском языке." },
        { role: "user", content: prompt }
      ], { jsonMode: true, modelName: settings?.modelName });

      res.json({
        thought: text,
        decision: aiDecision,
        matches: matches.map(m => ({ id: m.id, title: m.title, similarity: m.similarity })),
        embedding: JSON.stringify(embedding)
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
