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

// New Type Definition
export interface Attachment {
  url: string;
  name: string;
  type: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[]; // Refactored to Object Array
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
  uploadFile: (file: File) => Promise<Attachment | null>; // Return full object
  sendMessage: (
    text: string,
    attachments?: Attachment[]
  ) => Promise<string | null>; // Updated signature
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
          if (res.headers.get("content-type")?.includes("text/html")) {
            throw new Error("Servidor retornó HTML en lugar de JSON");
          }
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

          return {
            url: data.publicUrl,
            name: file.name,
            type: file.type,
          };
        } catch (error) {
          console.error("Error uploading file:", error);
          set({ isUploading: false, error: "Error al subir archivo." });
          return null;
        }
      },

      sendMessage: async (text: string, attachments: Attachment[] = []) => {
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
              conversationId,
              mode,
              topic,
              explainLevel,
              mood,
              attachments, // Sends full object array now
              isMobile: window.innerWidth < 1024,
            }),
          });

          if (!res.ok) throw new Error("Failed to send message");

          // Verify we got JSON, not an HTML error page (common with 404s/500s)
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("text/html")) {
            throw new Error(
              "Servidor retornó HTML en lugar de datos JSON (Posible 404/500)"
            );
          }

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
      name: "wadi-session-v1",
      partialize: (state) => ({
        mood: state.mood,
        conversationId: state.conversationId,
        messages: state.messages,
        hasStarted: state.hasStarted,
        // Don't persist isUploading
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.messages && state.messages.length > 0) {
          const lastMsg = state.messages[state.messages.length - 1];
          const welcomeBackText =
            "Volviste. El desorden sigue donde lo dejaste.";

          if (lastMsg.content !== welcomeBackText) {
            state.messages.push({
              id: "welcome-back-" + Date.now(),
              role: "assistant",
              content: welcomeBackText,
              created_at: new Date().toISOString(),
            });
          }
        }
      },
    }
  )
);
