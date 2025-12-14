import { create } from "zustand";
import { supabase } from "../config/supabase";

const rawUrl = import.meta.env.VITE_API_URL || "https://wadi-wxg7.onrender.com";
const API_URL = rawUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

export interface Conversation {
  id: string;
  title: string;
  mode: string;
  updated_at: string;
}

export type ChatMode = "normal" | "tech" | "biz" | "tutor";

interface ChatState {
  // State
  messages: Message[];
  conversations: Conversation[];
  conversationId: string | null;
  conversationTitle: string | null;
  isLoading: boolean;
  error: string | null;

  // Settings for NEW conversation
  mode: ChatMode;
  topic: string;
  explainLevel: "short" | "normal" | "detailed";

  // Actions
  setPreset: (
    preset: "tech" | "biz" | "learning" | "productivity" | "reflexivo"
  ) => void;
  setExplainLevel: (level: "short" | "normal" | "detailed") => void;

  fetchConversations: () => Promise<void>;
  startNewConversation: (initialTitle?: string) => Promise<string | null>;
  loadConversations: () => Promise<void>;
  openConversation: (id: string) => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  resetChat: () => void;
}

// Helper to get token
const getToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
};

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  conversations: [],
  conversationId: null,
  conversationTitle: null,
  isLoading: false,
  error: null,

  mode: "normal",
  topic: "general",
  explainLevel: "normal",

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

  setExplainLevel: (level) => set({ explainLevel: level }),

  resetChat: () =>
    set({
      conversationId: null,
      conversationTitle: null,
      messages: [],
      error: null,
    }),

  startNewConversation: async (initialTitle?: string) => {
    // Just reset local state. Actual creation happens on first message.
    set({
      conversationId: null,
      conversationTitle: initialTitle || null,
      messages: [],
      error: null,
      isLoading: false,
    });
    return null;
  },

  fetchConversations: async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${API_URL}/api/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch conversations");
      const data = await res.json();
      set({ conversations: data });
    } catch (err) {
      console.error(err);
    }
  },

  loadConversations: async () => {
    return get().fetchConversations();
  },

  openConversation: async (id: string) => {
    try {
      set({ isLoading: true, error: null, conversationId: id, messages: [] });
      const token = await getToken();
      if (!token) return;

      // 1. Get Details
      const res = await fetch(`${API_URL}/api/conversations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Conversation not found");
        throw new Error("Failed to load conversation");
      }

      const data = await res.json();
      set({
        messages: data.messages || [],
        conversationTitle: data.title,
        mode: data.mode as ChatMode,
        explainLevel: data.explain_level,
        isLoading: false,
      });
    } catch (err: unknown) {
      console.error(err);
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      set({ isLoading: false, error: errorMessage });
    }
  },

  loadConversation: async (id: string) => {
    // Alias to openConversation
    return get().openConversation(id);
  },

  sendMessage: async (text: string) => {
    if (!text.trim()) return;

    set({ isLoading: true, error: null });

    // 1. Optimistic User Message
    const tempId = crypto.randomUUID();
    const userMsg: Message = {
      id: tempId,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, userMsg] }));

    try {
      const token = await getToken();
      const { conversationId, mode, topic, explainLevel } = get();

      // 2. Call Unified /api/chat
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          conversationId, // Optional (null for new chat)
          mode,
          topic,
          explainLevel,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      const data = await res.json();

      // 3. Update State
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        created_at: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, aiMsg],
        isLoading: false,
        conversationId: data.conversationId, // Ensure state matches
      }));

      // Refresh list
      get().loadConversations();
      return data.conversationId; // Return ID explicitly for navigation
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      set({ isLoading: false, error: errorMessage });
      return null;
    }
  },

  deleteConversation: async (id: string) => {
    try {
      const token = await getToken();
      await fetch(`${API_URL}/api/conversations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      set((state) => {
        const nextConversations = state.conversations.filter(
          (c) => c.id !== id
        );
        // If current open conversation is deleted, reset
        if (state.conversationId === id) {
          return {
            conversations: nextConversations,
            conversationId: null,
            conversationTitle: null,
            messages: [],
          };
        }
        return { conversations: nextConversations };
      });
      // Try to start new if empty? handled by UI
    } catch (err) {
      console.error(err);
    }
  },
}));
