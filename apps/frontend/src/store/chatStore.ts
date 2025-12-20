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

// Make API_URL exported so components can reuse it
export const API_URL = apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

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
  isUploading: boolean;
  activeFocus: string | null;

  // Gamification
  rank: string;
  points: number;
  systemDeath: boolean;

  // Criminal Record (Long Term Memory)
  criminalRecord: {
    auditCount: number;
    riskCount: number;
  };

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
  fetchCriminalSummary: () => Promise<void>;
  startNewConversation: (initialTitle?: string) => Promise<string | null>;
  loadConversations: () => Promise<void>;
  openConversation: (id: string) => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  uploadFile: (file: File) => Promise<Attachment | null>;
  sendMessage: (
    text: string,
    attachments?: Attachment[]
  ) => Promise<string | null>;
  deleteConversation: (id: string) => Promise<void>;
  resetChat: () => void;
  admitFailure: () => Promise<void>;
}

// Helper to get token
const getToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Default State
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
      activeFocus: null,
      rank: "GENERADOR_DE_HUMO",
      points: 0,
      systemDeath: false,
      criminalRecord: { auditCount: 0, riskCount: 0 },
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

      fetchCriminalSummary: async () => {
        try {
          const token = await getToken();
          if (!token) return;
          const res = await fetch(`${API_URL}/api/user/criminal-summary`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            set({
              criminalRecord: {
                auditCount: data.totalAudits,
                riskCount: data.totalHighRisks,
              },
            });
          }
        } catch (e) {
          console.warn("Failed to fetch criminal record", e);
        }
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

          const res = await fetch(`${API_URL}/api/conversations/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) {
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
          set({ isLoading: false, hasStarted: false });
        }
      },

      loadConversation: async (id: string) => {
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

      admitFailure: async () => {
        try {
          const token = await getToken();
          if (!token) return;

          set({ isLoading: true });

          const res = await fetch(`${API_URL}/api/user/admit-failure`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });

          const data = await res.json();

          // Inject Monday's crushing response
          const aiMsg: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.reply,
            created_at: new Date().toISOString(),
          };

          set((state) => ({
            messages: [...state.messages, aiMsg],
            isLoading: false,
            activeFocus: null, // Cleared
            points: data.efficiencyPoints,
            rank: data.efficiencyRank,
          }));
        } catch (e) {
          console.error(e);
          set({ isLoading: false });
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
          const {
            conversationId,
            mode,
            topic,
            explainLevel,
            mood,
            rank: oldRank,
          } = get();

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
              attachments,
              isMobile: window.innerWidth < 1024,
            }),
          });

          if (!res.ok) throw new Error("Failed to send message");

          // Verify we got JSON
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("text/html")) {
            throw new Error("Servidor retornó HTML en lugar de JSON");
          }

          const data = await res.json();

          // Handle System Death
          if (data.systemDeath) {
            set({
              systemDeath: true,
              messages: [], // Wiped on client
              points: 0,
              rank: "GENERADOR_DE_HUMO",
              activeFocus: null,
              isLoading: false,
              conversationId: null,
            });
            // Redirect will be handled by UI listening to systemDeath
            return null;
          }

          // 3. Update State
          const aiMsg: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.reply,
            created_at: new Date().toISOString(),
          };

          const newRank =
            data.efficiencyRank !== undefined ? data.efficiencyRank : oldRank;

          set((state) => ({
            messages: [...state.messages, aiMsg],
            isLoading: false,
            conversationId: data.conversationId,
            activeFocus: data.activeFocus || null,
            points:
              data.efficiencyPoints !== undefined
                ? data.efficiencyPoints
                : state.points,
            rank: newRank,
          }));

          // Rank Change Notification
          if (newRank !== oldRank && newRank !== "GENERADOR_DE_HUMO") {
            const rankMsg: Message = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `[SISTEMA]: ASCENSO A RANGO **${newRank}**. NO TE ACOSTUMBRES.`,
              created_at: new Date().toISOString(),
            };
            set((state) => ({ messages: [...state.messages, rankMsg] }));
          }

          // Refresh list
          get().loadConversations();
          return data.conversationId;
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
          const res = await fetch(`${API_URL}/api/conversations/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) throw new Error("Delete failed");

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
        // Don't persist isUploading or blocked states if they are ephemeral
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
