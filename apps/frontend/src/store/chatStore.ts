import { create } from "zustand";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;

  sendMessage: (text: string) => Promise<void>;
  resetChat: () => void;
}

const rawUrl = import.meta.env.VITE_API_URL || "https://wadi-wxg7.onrender.com";
const API_URL = rawUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  error: null,

  resetChat: () => set({ messages: [], error: null, isLoading: false }),

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
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
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
