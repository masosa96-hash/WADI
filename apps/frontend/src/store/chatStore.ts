import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WadiMood } from "../components/WadiOnboarding";
import { supabase } from "../config/supabase";

const rawUrl = import.meta.env.VITE_API_URL;
let apiUrl = rawUrl || "https://wadi-wxg7.onrender.com";

// Runtime check: If we are NOT on localhost, we should NOT call localhost.
if (
  typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1" &&
  (apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1"))
) {
  console.warn(
    "Detected localhost API URL in production/remote. Switching to relative path."
  );
  apiUrl = "";
}

const API_URL = apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: string[]; // New: Support for attachments
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
  hasStarted: boolean;
  mood: WadiMood;
  isSidebarOpen: boolean;
  isUploading: boolean; // New: Uploading state

  // Settings for NEW conversation
  mode: ChatMode;
  topic: string;
  explainLevel: "short" | "normal" | "detailed";

  // Actions
  setPreset: (
    preset: "tech" | "biz" | "learning" | "productivity" | "reflexivo"
  ) => void;
  setMood: (mood: WadiMood) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setExplainLevel: (level: "short" | "normal" | "detailed") => void;

  fetchConversations: () => Promise<void>;
  startNewConversation: (initialTitle?: string) => Promise<string | null>;
  loadConversations: () => Promise<void>;
  openConversation: (id: string) => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  uploadFile: (file: File) => Promise<string | null>; // New: Upload action
  sendMessage: (text: string, attachments?: string[]) => Promise<string | null>; // Updated signature
  deleteConversation: (id: string) => Promise<void>;
  resetChat: () => void;
}

// Helper to get token
const getToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      conversations: [],
      conversationId: null,
      conversationTitle: null,
      isLoading: false,
      error: null,
      hasStarted: false,
      mood: "hostile",
      isSidebarOpen: false,
      isUploading: false,

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

      setMood: (mood) => set({ mood }),

      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

      setExplainLevel: (level) => set({ explainLevel: level }),

      resetChat: () =>
        set({
          conversationId: null,
          conversationTitle: null,
          messages: [],
          error: null,
          hasStarted: false,
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
          set({
            isLoading: true,
            error: null,
            conversationId: id,
            messages: [],
          });
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
            hasStarted: data.messages && data.messages.length > 0,
          });
        } catch (err: unknown) {
          console.error(err);
          const errorMessage =
            err instanceof Error ? err.message : "An error occurred";
          set({ isLoading: false, error: errorMessage, hasStarted: false });
        }
      },

      loadConversation: async (id: string) => {
        // Alias to openConversation
        return get().openConversation(id);
      },

      uploadFile: async (file: File) => {
        set({ isUploading: true });
        try {
          const fileExt = file.name.split(".").pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("wadi-attachments")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from("wadi-attachments")
            .getPublicUrl(filePath);

          set({ isUploading: false });
          return data.publicUrl;
        } catch (error) {
          console.error("Error uploading file:", error);
          set({ isUploading: false, error: "Error al subir archivo." });
          return null;
        }
      },

      sendMessage: async (text: string, attachments: string[] = []) => {
        if (!text.trim() && attachments.length === 0) return null;

        set({ isLoading: true, error: null, hasStarted: true });

        // 1. Optimistic User Message
        const tempId = crypto.randomUUID();
        const userMsg: Message = {
          id: tempId,
          role: "user",
          content: text,
          attachments: attachments,
          created_at: new Date().toISOString(),
        };
        set((state) => ({ messages: [...state.messages, userMsg] }));

        try {
          const token = await getToken();
          const { conversationId, mode, topic, explainLevel, mood } = get();

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
              mood, // 💥 Sent to backend to influence system prompt
              attachments, // 📎 Send attachments
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
        } catch (err) {
          console.error(err);
        }
      },
    }),
    {
      name: "wadi-storage",
      partialize: (state) => ({
        mood: state.mood,
        conversationId: state.conversationId,
        messages: state.messages,
        hasStarted: state.hasStarted,
        // Don't persist isUploading
      }),
    }
  )
);
