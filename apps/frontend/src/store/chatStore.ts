import { create } from "zustand";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

interface ChatPreferences {
  mode: "general" | "tech" | "biz" | "tutor";
  tone: "direct" | "explanatory" | "step_by_step";
  language: "auto" | "es" | "en";
}

interface TutorModeState {
  active: boolean;
  topic: string | null;
  level: "principiante" | "intermedio" | "avanzado" | null;
  targetTime: string | null;
  currentStep: number;
  totalSteps: number;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  preferences: ChatPreferences;
  tutorMode: TutorModeState;

  sendMessage: (text: string) => Promise<void>;
  resetChat: () => void;
  setPreferences: (prefs: Partial<ChatPreferences>) => void;

  startTutorConversation: (params: {
    topic: string;
    level: "principiante" | "intermedio" | "avanzado";
    targetTime: string;
  }) => Promise<void>;
  updateTutorProgress: (current: number, total: number) => void;
  stopTutorMode: () => void;
}

const rawUrl = import.meta.env.VITE_API_URL || "https://wadi-wxg7.onrender.com";
const API_URL = rawUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

const INITIAL_TUTOR_STATE: TutorModeState = {
  active: false,
  topic: null,
  level: null,
  targetTime: null,
  currentStep: 0,
  totalSteps: 0,
};

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  preferences: {
    mode: "general",
    tone: "explanatory",
    language: "auto",
  },
  tutorMode: { ...INITIAL_TUTOR_STATE },

  resetChat: () =>
    set({
      messages: [],
      error: null,
      isLoading: false,
      tutorMode: { ...INITIAL_TUTOR_STATE },
    }),

  setPreferences: (prefs) =>
    set((state) => ({ preferences: { ...state.preferences, ...prefs } })),

  stopTutorMode: () =>
    set((state) => ({
      tutorMode: { ...INITIAL_TUTOR_STATE },
      preferences: { ...state.preferences, mode: "general" },
    })),

  updateTutorProgress: (current, total) =>
    set((state) => ({
      tutorMode: {
        ...state.tutorMode,
        currentStep: current,
        totalSteps: total,
      },
    })),

  startTutorConversation: async ({ topic, level, targetTime }) => {
    // 1. Set Local State
    set((state) => ({
      tutorMode: {
        active: true,
        topic,
        level,
        targetTime,
        currentStep: 1,
        totalSteps: 1, // Will update when backend replies
      },
      preferences: { ...state.preferences, mode: "tutor" },
    }));

    // 2. Send System Prompt via sendMessage
    const prompt = `[SYSTEM: ACTIVATING TUTOR MODE]
Quiero aprender sobre: "${topic}".
Mi nivel es: ${level}.
Tiempo objetivo: ${targetTime}.
Por favor armá un plan de estudio paso a paso, y guiame empezando por el paso 1.
Adaptá tu estilo a un tutor interactivo.`;

    await get().sendMessage(prompt);
  },

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
      const { preferences, tutorMode } = get();
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          ...preferences,
          tutorMode, // Sending the full state object
        }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();

      // Check for tutor metadata updates
      if (tutorMode.active && data.tutorMeta) {
        set((state) => ({
          tutorMode: {
            ...state.tutorMode,
            currentStep:
              data.tutorMeta.currentStep || state.tutorMode.currentStep,
            totalSteps: data.tutorMeta.totalSteps || state.tutorMode.totalSteps,
          },
        }));
      }

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
