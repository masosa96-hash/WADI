import { create } from "zustand";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export type ChatMode = "normal" | "tech" | "biz" | "tutor";

interface ChatState {
  // State
  messages: Message[];
  isLoading: boolean;
  error: string | null;

  mode: ChatMode;
  topic: string;
  explainLevel: "short" | "normal" | "detailed";

  // Actions
  sendMessage: (text: string) => Promise<void>;
  resetChat: () => void;
  setPreset: (
    preset: "tech" | "biz" | "learning" | "productivity" | "reflexivo"
  ) => void;
  setExplainLevel: (level: "short" | "normal" | "detailed") => void;
}

const rawUrl = import.meta.env.VITE_API_URL || "https://wadi-wxg7.onrender.com";
const API_URL = rawUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  mode: "normal",
  topic: "general",
  explainLevel: "normal",

  resetChat: () =>
    set({
      messages: [],
      error: null,
      isLoading: false,
      mode: "normal",
      topic: "general",
      explainLevel: "normal",
    }),

  setPreset: (preset) =>
    set((state) => {
      switch (preset) {
        case "tech":
          return {
            ...state,
            mode: "tech",
            topic: "general",
            explainLevel: "normal",
          };
        case "biz":
          return {
            ...state,
            mode: "biz",
            topic: "negocios",
            explainLevel: "normal",
          };
        case "learning":
          return {
            ...state,
            mode: "tutor",
            topic: "aprendizaje",
            explainLevel: "detailed",
          };
        case "productivity":
          return {
            ...state,
            mode: "normal",
            topic: "productividad",
            explainLevel: "short",
          };
        case "reflexivo":
          return {
            ...state,
            mode: "normal",
            topic: "general",
            explainLevel: "normal",
          };
        default:
          return state;
      }
    }),

  setExplainLevel: (level: "short" | "normal" | "detailed") =>
    set({ explainLevel: level }),

  sendMessage: async (text: string) => {
    if (!text.trim()) return;

    set({ isLoading: true, error: null });

    // 1. Optimistic update (User message)
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };

    set((state) => ({ messages: [...state.messages, userMsg] }));

    try {
      const { mode, topic, explainLevel } = get();

      const payload = {
        message: text,
        mode,
        topic,
        explainLevel,
      };

      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();

      // 2. Add AI response
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply || "No response content.",
        createdAt: Date.now(),
      };

      set((state) => ({
        messages: [...state.messages, aiMsg],
        isLoading: false,
      }));
    } catch (err: unknown) {
      console.error("Chat error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error al conectar con WADI.";
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },
}));
