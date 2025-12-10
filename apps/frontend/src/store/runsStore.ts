import { create } from "zustand";

interface Run {
  id: string;
  input: string;
  output: string;
  created_at: string;
}

interface RunsState {
  runs: Run[];
  loading: boolean;
  fetchRuns: (projectId: string) => Promise<void>;
  createRun: (projectId: string, input: string) => Promise<void>;
}

const rawUrl = import.meta.env.VITE_API_URL || "https://wadi-wxg7.onrender.com";
const API_URL = rawUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

export const useRunsStore = create<RunsState>((set) => ({
  runs: [],
  loading: false,

  fetchRuns: async (projectId) => {
    set({ loading: true });

    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/runs`);
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      set({ runs: data, loading: false });
    } catch (e) {
      console.error("Failed to fetch runs", e);
      set({ loading: false });
    }
  },

  createRun: async (projectId, input) => {
    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      set((state) => ({ runs: [data, ...state.runs] }));
    } catch (e) {
      console.error("Failed to create run", e);
      throw e;
    }
  },
}));
