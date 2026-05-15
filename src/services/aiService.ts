import { GoogleGenAI } from "@google/genai";

export interface AIResponse {
  text: string;
  action?: string;
  confidence?: number;
  targetBranchId?: string;
  reasoning?: string;
  subtasks?: string[];
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIProvider {
  chat(messages: ChatMessage[], config: any): Promise<AIResponse>;
  embed(text: string, config: any): Promise<number[]>;
}

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  async chat(messages: ChatMessage[], config: any): Promise<AIResponse> {
    const model = config.modelName || "gemini-3-flash-preview";
    const systemMessage = messages.find(m => m.role === "system")?.content;
    const history = messages.filter(m => m.role !== "system").map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    // For simplicity, we use generateContent directly or a chat session
    const response = await this.genAI.models.generateContent({
      model,
      contents: history,
      config: {
        systemInstruction: systemMessage,
        responseMimeType: config.jsonMode ? "application/json" : "text/plain",
      }
    });

    const text = response.text || "";
    if (config.jsonMode) {
      try {
        return JSON.parse(text);
      } catch (e) {
        return { text };
      }
    }
    return { text };
  }

  async embed(text: string, config: any): Promise<number[]> {
    const result = await this.genAI.models.embedContent({
      model: "gemini-embedding-2-preview",
      contents: [text],
    });
    return result.embeddings[0].values;
  }
}

// Minimal implementation for OpenAI-compatible (LM Studio, OpenRouter)
export class OpenAICompatibleProvider implements AIProvider {
  private baseUrl: string;
  private apiKey: string;
  private model: string;

  constructor(baseUrl: string, apiKey: string, model: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.model = model;
  }

  async chat(messages: ChatMessage[], config: any): Promise<AIResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        response_format: config.jsonMode ? { type: "json_object" } : undefined,
      })
    });

    const data = await response.json();
    const text = data.choices[0].message.content;
    
    if (config.jsonMode) {
      try {
        return JSON.parse(text);
      } catch (e) {
        return { text };
      }
    }
    return { text };
  }

  async embed(text: string, config: any): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: config.embeddingModel || "text-embedding-3-small",
        input: text,
      })
    });
    const data = await response.json();
    return data.data[0].embedding;
  }
}

export class AIProviderFactory {
  static create(settings: any): AIProvider {
    switch (settings.aiProvider) {
      case "lmstudio":
      case "openrouter":
      case "custom":
        return new OpenAICompatibleProvider(
          settings.baseUrl || "http://localhost:1234/v1",
          settings.apiKey || "not-needed",
          settings.modelName || "model-not-set"
        );
      case "gemini":
      default:
        return new GeminiProvider(settings.apiKey || process.env.GEMINI_API_KEY || "");
    }
  }
}
