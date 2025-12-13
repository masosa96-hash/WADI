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
  startNewConversation: () => Promise<string | null>;
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

  resetChat: () => set({ conversationId: null, messages: [], error: null }),

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

  startNewConversation: async () => {
    try {
      set({ isLoading: true, error: null });
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const { mode, topic, explainLevel } = get();

      const res = await fetch(`${API_URL}/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mode, topic, explainLevel }),
      });

      if (!res.ok) throw new Error("Failed to create conversation");

      const data = await res.json();
      set({ conversationId: data.id, messages: [], isLoading: false });

      // Refresh list
      get().fetchConversations();

      return data.id;
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      return null;
    }
  },

  loadConversation: async (id: string) => {
    try {
      set({ isLoading: true, error: null, conversationId: id, messages: [] });
      const token = await getToken();
      if (!token) return; // Should handle auth error

      const res = await fetch(`${API_URL}/api/conversations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Conversation not found");
        throw new Error("Failed to load conversation");
      }

      const data = await res.json();
      // data contains { ..., messages: [...] }
      set({
        messages: data.messages || [],
        mode: data.mode as ChatMode, // Sync settings from loaded chat?
        explainLevel: data.explain_level,
        isLoading: false,
      });
    } catch (err: any) {
      console.error(err);
      set({ isLoading: false, error: err.message });
    }
  },

  sendMessage: async (text: string) => {
    if (!text.trim()) return;

    const { conversationId } = get();
    if (!conversationId) {
      // If no ID, maybe start one?
      // Logic says: "startNewConversation -> navigate".
      // If we are here, we should have an ID or we are in a broken state.
      // Assuming the UI handles creation before sending or we auto-create.
      // Let's auto-create if needed? User said "El botón... debe llamar a startNewConversation".
      // But if user types in main input without clicking chips?
      // Let's handle generic flow: If no ID, create one first.
      const newId = await get().startNewConversation();
      if (!newId) return;
      // The store is updated, but local var 'conversationId' is stale.
      // Use newId.
      // Actually, we need to return here and let the UI navigate?
      // Let's implement auto-create inside sendMessage for robustness.
      // But startNewConversation does a fetch.
      // We'll proceed with newId.
      return get().sendMessage(text); // Recursion with set ID
    }

    set({ isLoading: true, error: null });

    // 1. Optimistic
    const tempId = crypto.randomUUID();
    const userMsg: Message = { id: tempId, role: "user", content: text };
    set((state) => ({ messages: [...state.messages, userMsg] }));

    try {
      const token = await getToken();
      const res = await fetch(
        `${API_URL}/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: text,
            // settings are updated in conversation, but we can pass them in case we want to override
            // standard is to follow existing conv settings or send updates if changed
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to send message");
      const data = await res.json();

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        created_at: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, aiMsg],
        isLoading: false,
      }));

      // Refresh list to update title/timestamp
      get().fetchConversations();
    } catch (err: any) {
      // Rollback? Or just show error
      set({ isLoading: false, error: err.message });
      // Remove optimistic message? Maybe not, allow retry.
    }
  },

  deleteConversation: async (id: string) => {
    try {
      const token = await getToken();
      await fetch(`${API_URL}/api/conversations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        conversations: state.conversations.filter((c) => c.id !== id),
        conversationId:
          state.conversationId === id ? null : state.conversationId,
        messages: state.conversationId === id ? [] : state.messages,
      }));
    } catch (err) {
      console.error(err);
    }
  },
}));
